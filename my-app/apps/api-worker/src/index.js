export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // POST /signup
      if (path === "/signup" && request.method === "POST") {
        const { fullName, email, password, role, phone, address, age, gender } = await request.json();
        
        // Check if user exists
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (existing) {
          return new Response(JSON.stringify({ success: false, message: "User already exists" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const result = await env.DB.prepare(
          "INSERT INTO users (fullName, email, password, role, phone, address, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(fullName, email, password, role || 'employee', phone, address, age, gender).run();

        // Initialize employee details
        const newUser = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        await env.DB.prepare("INSERT INTO employee_attendance_detail (user_id) VALUES (?)").bind(newUser.id).run();

        return new Response(JSON.stringify({ success: true, message: "User created" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // POST /login
      if (path === "/login" && request.method === "POST") {
        const { email, password } = await request.json();
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ?").bind(email, password).first();
        
        if (user) {
          return new Response(JSON.stringify({ success: true, user }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          return new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // GET /attendance/status?user_id=...
      if (path === "/attendance/status" && request.method === "GET") {
        const user_id = url.searchParams.get("user_id");
        const now = new Date();
        const nepalTime = new Date(now.getTime() + (5 * 60 + 45) * 60 * 1000);
        const today = nepalTime.toISOString().split('T')[0];
        const log = await env.DB.prepare("SELECT * FROM attendance_logs WHERE user_id = ? AND date = ? ORDER BY id DESC LIMIT 1").bind(user_id, today).first();
        
        const status = (log && !log.check_out_time) ? 'checked_in' : 'checked_out';
        return new Response(JSON.stringify({ status, last_log: log }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // POST /checkin
      if (path === "/checkin" && request.method === "POST") {
        const { user_id } = await request.json();
        const now = new Date();
        const isoNow = now.toISOString();

        // Calculate Nepal Time (UTC + 5:45)
        const nepalTime = new Date(now.getTime() + (5 * 60 + 45) * 60 * 1000);
        const today = nepalTime.toISOString().split('T')[0];
        const totalMinutes = nepalTime.getUTCHours() * 60 + nepalTime.getUTCMinutes();

        // Thresholds in minutes from midnight (Nepal)
        const presentStart   = 10 * 60;        // 10:00 AM
        const lateThreshold  = 10 * 60 + 30;   // 10:30 AM
        const absentThreshold = 12 * 60;        // 12:00 PM

        let attendanceStatus;
        if (totalMinutes > absentThreshold) {
          attendanceStatus = 'Absent';
        } else if (totalMinutes > lateThreshold) {
          attendanceStatus = 'Late';
        } else {
          attendanceStatus = 'Present';  // covers before 10:00 AM too
        }

        // Auto check-out for any forgotten sessions from previous days
        const pendingLogs = await env.DB.prepare(
          "SELECT id FROM attendance_logs WHERE user_id = ? AND check_out_time IS NULL AND date < ?"
        ).bind(user_id, today).all();

        if (pendingLogs.results.length > 0) {
          for (const log of pendingLogs.results) {
            // Mark as auto checked-out
            await env.DB.prepare(
              "UPDATE attendance_logs SET check_out_time = 'AUTO' WHERE id = ?"
            ).bind(log.id).run();

            // Add 8 hours constant for each forgotten check-out
            await env.DB.prepare("INSERT OR IGNORE INTO employee_attendance_detail (user_id) VALUES (?)").bind(user_id).run();
            await env.DB.prepare(
              "UPDATE employee_attendance_detail SET total_working_hour = total_working_hour + 8 WHERE user_id = ?"
            ).bind(user_id).run();
          }
        }

        const existing = await env.DB.prepare(
          "SELECT id FROM attendance_logs WHERE user_id = ? AND date = ?"
        ).bind(user_id, today).first();
        if (existing) {
          return new Response(JSON.stringify({ success: false, message: "Already checked in today" }), { 
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
          });
        }

        // Store the real status directly — never 'In Progress'
        await env.DB.prepare(
          "INSERT INTO attendance_logs (user_id, date, check_in_time, status) VALUES (?, ?, ?, ?)"
        ).bind(user_id, today, isoNow, attendanceStatus).run();

        // Ensure summary row exists first
        await env.DB.prepare("INSERT OR IGNORE INTO employee_attendance_detail (user_id) VALUES (?)").bind(user_id).run();

        // Update summary table
        if (attendanceStatus === 'Absent') {
          await env.DB.prepare(
            "UPDATE employee_attendance_detail SET total_absent = total_absent + 1, total_working_days = total_working_days + 1 WHERE user_id = ?"
          ).bind(user_id).run();
        } else if (attendanceStatus === 'Late') {
          await env.DB.prepare(
            "UPDATE employee_attendance_detail SET total_late = total_late + 1, total_present = total_present + 1, total_working_days = total_working_days + 1 WHERE user_id = ?"
          ).bind(user_id).run();
        } else {
          await env.DB.prepare(
            "UPDATE employee_attendance_detail SET total_present = total_present + 1, total_working_days = total_working_days + 1 WHERE user_id = ?"
          ).bind(user_id).run();
        }

        return new Response(JSON.stringify({ success: true, status: attendanceStatus }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // POST /checkout
      if (path === "/checkout" && request.method === "POST") {
        const { user_id } = await request.json();
        const now = new Date();
        const isoNow = now.toISOString();
        const nepalTime = new Date(now.getTime() + (5 * 60 + 45) * 60 * 1000);
        const today = nepalTime.toISOString().split('T')[0];

        const log = await env.DB.prepare(
          "SELECT * FROM attendance_logs WHERE user_id = ? AND date = ? AND check_out_time IS NULL"
        ).bind(user_id, today).first();
        if (!log) {
          return new Response(JSON.stringify({ success: false, message: "No active check-in found" }), { 
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
          });
        }

        // Only update check_out_time — DO NOT touch status (it is already correct from check-in)
        await env.DB.prepare(
          "UPDATE attendance_logs SET check_out_time = ? WHERE id = ?"
        ).bind(isoNow, log.id).run();

        const diffHours = (new Date(isoNow) - new Date(log.check_in_time)) / (1000 * 60 * 60);

        // Ensure summary row exists first
        await env.DB.prepare("INSERT OR IGNORE INTO employee_attendance_detail (user_id) VALUES (?)").bind(user_id).run();

        // Update summary table: increase worked hours ONLY
        await env.DB.prepare(
          "UPDATE employee_attendance_detail SET total_working_hour = total_working_hour + ? WHERE user_id = ?"
        ).bind(diffHours, user_id).run();

        return new Response(JSON.stringify({ success: true, hours: diffHours }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // PUT /profile
      if (path === "/profile" && request.method === "PUT") {
        const { id, fullName, email, phone, address, role, age, gender } = await request.json();
        
        await env.DB.prepare(
          "UPDATE users SET fullName = ?, email = ?, phone = ?, address = ?, role = ?, age = ?, gender = ? WHERE id = ?"
        ).bind(fullName, email, phone, address, role, age, gender, id).run();

        const updatedUser = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();

        return new Response(JSON.stringify({ success: true, user: updatedUser }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // POST /leave-request
      if (path === "/leave-request" && request.method === "POST") {
        const { user_id, LQM, leave_days } = await request.json();
        
        await env.DB.prepare(
          "INSERT INTO leave_requests (user_id, LQM, leave_days) VALUES (?, ?, ?)"
        ).bind(user_id, LQM, leave_days).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // PUT /leave-request/approve
      if (path === "/leave-request/approve" && request.method === "PUT") {
        const { request_id, approval } = await request.json();
        
        // Get the request details first
        const leaveRequest = await env.DB.prepare("SELECT * FROM leave_requests WHERE id = ?").bind(request_id).first();
        if (!leaveRequest) {
          return new Response(JSON.stringify({ success: false, message: "Request not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update request status
        await env.DB.prepare("UPDATE leave_requests SET approval = ? WHERE id = ?").bind(approval, request_id).run();

        // If approved (1), update employee summary
        if (approval === 1) {
          await env.DB.prepare(
            "UPDATE employee_attendance_detail SET total_leave = total_leave + ? WHERE user_id = ?"
          ).bind(leaveRequest.leave_days, leaveRequest.user_id).run();
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET /stats?email=...
      if (path === "/stats" && request.method === "GET") {
        const email = url.searchParams.get("email");
        const user = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (!user) return new Response("User not found", { status: 404 });

        // Ensure summary row exists
        await env.DB.prepare("INSERT OR IGNORE INTO employee_attendance_detail (user_id) VALUES (?)").bind(user.id).run();

        const summary = await env.DB.prepare("SELECT * FROM employee_attendance_detail WHERE user_id = ?").bind(user.id).first();
        
        const stats = {
          workedDays: summary?.total_working_days || 0,
          workedHours: (summary?.total_working_hour || 0).toFixed(1) + 'h',
          absentDays: summary?.total_absent || 0,
          lateDays: summary?.total_late || 0,
          onLeave: summary?.total_leave || 0,
        };

        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET /attendance/logs?user_id=...
      if (path === "/attendance/logs" && request.method === "GET") {
        const user_id = url.searchParams.get("user_id");
        const logs = await env.DB.prepare(
          "SELECT * FROM attendance_logs WHERE user_id = ? ORDER BY date DESC, check_in_time DESC LIMIT 50"
        ).bind(user_id).all();
        
        return new Response(JSON.stringify(logs.results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET /admin/overview
      if (path === "/admin/overview" && request.method === "GET") {
        const totalEmployees = await env.DB.prepare("SELECT count(*) as count FROM users WHERE role != 'admin'").first();
        const totalWorkingDays = await env.DB.prepare("SELECT count(*) as count FROM calendar_events WHERE status = 'working'").first();
        const totalHolidays = await env.DB.prepare("SELECT count(*) as count FROM calendar_events WHERE status = 'holiday'").first();
        const pendingLeaveCount = await env.DB.prepare("SELECT count(*) as count FROM leave_requests WHERE approval IS NULL").first();
        
        const now = new Date();
        const nepalTime = new Date(now.getTime() + (5 * 60 + 45) * 60 * 1000);
        const today = nepalTime.toISOString().split('T')[0];
        const totalMinutes = nepalTime.getUTCHours() * 60 + nepalTime.getUTCMinutes();

        // Count Present (including Late, as they are also present)
        const presentCount = await env.DB.prepare("SELECT count(*) as count FROM attendance_logs WHERE date = ? AND (status = 'Present' OR status = 'Late')").bind(today).first();
        
        // Count Late specifically
        const lateCount = await env.DB.prepare("SELECT count(*) as count FROM attendance_logs WHERE date = ? AND status = 'Late'").bind(today).first();
        
        // Count Absent (either marked in log or automatically considered after 12:01 PM)
        const logAbsentCount = await env.DB.prepare("SELECT count(*) as count FROM attendance_logs WHERE date = ? AND status = 'Absent'").bind(today).first();
        
        let totalAbsent = logAbsentCount.count;
        if (totalMinutes > 12 * 60) {
          // If past 12:00 PM, anyone who hasn't checked in is absent
          const nonCheckedIn = totalEmployees.count - presentCount.count - logAbsentCount.count;
          totalAbsent += Math.max(0, nonCheckedIn);
        }

        return new Response(JSON.stringify({
          totalEmployees: totalEmployees.count,
          totalWorkingDays: totalWorkingDays.count || 0,
          totalHolidays: totalHolidays.count || 0,
          presentToday: presentCount.count,
          absentToday: totalAbsent, 
          lateToday: lateCount.count,
          pendingLeaveCount: pendingLeaveCount.count || 0,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET /admin/leave-requests
      if (path === "/admin/leave-requests" && request.method === "GET") {
        const requests = await env.DB.prepare(`
          SELECT lr.*, u.fullName as employeeName 
          FROM leave_requests lr 
          JOIN users u ON lr.user_id = u.id 
          WHERE lr.approval IS NULL
          ORDER BY lr.created_at DESC
        `).all();
        
        return new Response(JSON.stringify(requests.results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET /calendar
      if (path === "/calendar" && request.method === "GET") {
        const events = await env.DB.prepare("SELECT * FROM calendar_events").all();
        return new Response(JSON.stringify(events.results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // POST /calendar (Admin only)
      if (path === "/calendar" && request.method === "POST") {
        const { date, status, updated_by } = await request.json();
        
        if (status === 'clear') {
          await env.DB.prepare("DELETE FROM calendar_events WHERE date = ?").bind(date).run();
        } else {
          await env.DB.prepare(`
            INSERT INTO calendar_events (date, status, updated_by) 
            VALUES (?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET status = excluded.status, updated_by = excluded.updated_by, updated_at = CURRENT_TIMESTAMP
          `).bind(date, status, updated_by || 'admin').run();
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET /employees
      if (path === "/employees" && request.method === "GET") {
        const now = new Date();
        // All date/time logic uses Nepal Time (UTC + 5:45)
        const nepalTime = new Date(now.getTime() + (5 * 60 + 45) * 60 * 1000);
        const today = nepalTime.toISOString().split('T')[0];
        const totalMinutes = nepalTime.getUTCHours() * 60 + nepalTime.getUTCMinutes();
        const isAfterAbsentThreshold = totalMinutes > 12 * 60; // past 12:00 PM

        // Fetch all employees (non-admin) with their attendance log for today
        const results = await env.DB.prepare(`
          SELECT 
            u.id, u.fullName AS name, u.email, u.role,
            al.check_in_time,
            al.check_out_time,
            al.status AS logStatus
          FROM users u
          LEFT JOIN attendance_logs al 
            ON u.id = al.user_id AND al.date = ?
          WHERE u.role != 'admin'
        `).bind(today).all();

        const employees = results.results.map(emp => {
          let displayStatus;
          let dutyStatus;

          if (emp.check_in_time) {
            // --- Employee has scanned QR today ---
            // Attendance status comes directly from DB (Present / Late / Absent)
            // For old records saved as 'In Progress', recalculate from check-in time
            if (emp.logStatus === 'In Progress') {
              const ciNepal = new Date(new Date(emp.check_in_time).getTime() + (5 * 60 + 45) * 60 * 1000);
              const ciMins = ciNepal.getUTCHours() * 60 + ciNepal.getUTCMinutes();
              displayStatus = ciMins > 10 * 60 + 30 ? 'Late' : 'Present';
            } else {
              displayStatus = emp.logStatus; // 'Present', 'Late', or 'Absent'
            }
            // Duty status: On Duty until they check out
            dutyStatus = emp.check_out_time ? 'Off Duty' : 'On Duty';
          } else {
            // --- Employee has NOT scanned QR today ---
            if (isAfterAbsentThreshold) {
              // Past 12:00 PM and still no scan → Absent
              displayStatus = 'Absent';
              dutyStatus = 'Off Duty';
            } else {
              // Before 12:00 PM, not yet checked in
              displayStatus = 'Not Checked In';
              dutyStatus = 'Default';
            }
          }

          return {
            id: emp.id,
            name: emp.name,
            email: emp.email,
            role: emp.role,
            status: displayStatus,
            dutyStatus,
          };
        });

        return new Response(JSON.stringify(employees), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response("Not Found", { status: 404 });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
  },
};
