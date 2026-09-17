/* ═══════════════════════════════════════════════════════════════
   CVC Hire — apiClient.js  (STATIC / localStorage version)

   This file replaces the old PHP + MySQL backend.
   It exposes the exact same `api` object that JobPortalscript.js
   already calls, so NO changes are needed in that file.

   Data lives in the visitor's own browser (localStorage), which
   means this works on GitHub Pages with no server at all.
   ═══════════════════════════════════════════════════════════════ */

(function () {
    "use strict";

    const DB_KEY = "cvc_hire_db";

    /* ─── Storage helpers ───────────────────────────────────── */
    function blankDB() {
        return {
            users: [],             // {id, role, name, email, password}
            jobs: [],              // {id, employer_id, title, company, type, location, salary, description, created_at}
            applications: [],      // {id, job_id, student_email, student_name, status, applied_at}
            saved: [],             // {student_email, job_id}
            messages: [],          // {id, job_id, student_email, sender, message, created_at}
            studentProfiles: {},   // email -> {...}
            employerProfiles: {},  // email -> {...}
            nextId: 1
        };
    }

    function load() {
        try {
            const raw = localStorage.getItem(DB_KEY);
            if (!raw) return seed();
            const db = JSON.parse(raw);
            // guard against a half-written / old-format record
            const fresh = blankDB();
            for (const k in fresh) if (!(k in db)) db[k] = fresh[k];
            return db;
        } catch (e) {
            console.warn("CVC Hire: could not read saved data, starting fresh.", e);
            return seed();
        }
    }

    function save(db) {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(db));
        } catch (e) {
            console.error("CVC Hire: could not save data.", e);
        }
    }

    function newId(db) { return db.nextId++; }

    /* Timestamp in the "YYYY-MM-DD HH:MM:SS" shape the UI expects */
    function now() {
        const d = new Date(), p = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
               `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    }

    /* Errors are thrown as {error: "..."} because the UI reads err.error */
    function fail(msg) { throw { error: msg }; }

    /* Every method is async so it behaves like a real network call */
    function ok(value) { return Promise.resolve(value); }

    /* ─── First-run demo data ───────────────────────────────── */
    function seed() {
        const db = blankDB();

        const student = { id: newId(db), role: "student",  name: "Demo Student", email: "student@gmail.com", password: "student123" };
        const manager = { id: newId(db), role: "employee", name: "Demo Manager", email: "manager@gmail.com", password: "manager123" };
        db.users.push(student, manager);

        db.employerProfiles[manager.email] = {
            company_name: "TechCorp Inc.",
            industry: "Information Technology",
            website: "https://techcorp.example.com",
            description: "A sample employer account so you can see how the dashboard looks.",
            contact_name: "Demo Manager",
            phone: "09XX-XXX-XXXX",
            address: "Davao City, Philippines"
        };

        db.jobs.push({
            id: newId(db), employer_id: manager.id,
            title: "Web Developer Intern", company: "TechCorp Inc.",
            type: "internship", location: "Remote", salary: "8000",
            description: "Help build and maintain internal web tools. HTML, CSS and JavaScript required.",
            created_at: now()
        });
        db.jobs.push({
            id: newId(db), employer_id: manager.id,
            title: "Junior IT Support", company: "TechCorp Inc.",
            type: "fulltime", location: "Davao", salary: "18000",
            description: "Front-line support for staff hardware and software issues.",
            created_at: now()
        });

        save(db);
        return db;
    }

    /* ═══════════════════════════════════════════════════════════
       THE API
       ═══════════════════════════════════════════════════════════ */
    const api = {

        /* ─── Auth ──────────────────────────────────────────── */
        register(role, name, email, password) {
            const db = load();
            email = String(email || "").trim().toLowerCase();
            if (!role || !name || !email || !password) fail("Please fill all fields");
            if (db.users.some(u => u.email === email)) fail("That email is already registered");

            const user = {
                id: newId(db),
                role: role === "employee" ? "employee" : "student",
                name: String(name).trim(),
                email,
                password: String(password)
            };
            db.users.push(user);
            save(db);
            return ok({ success: true, user: { id: user.id, email: user.email } });
        },

        login(role, email, password) {
            const db = load();
            email = String(email || "").trim().toLowerCase();
            const user = db.users.find(u => u.email === email && u.role === role);

            if (!user)                      fail("No account found for that email and role");
            if (user.password !== password) fail("Incorrect password");

            let displayName = user.name;
            if (role === "student") {
                const p = db.studentProfiles[email];
                if (p) {
                    const n = `${p.last_name || ""} ${p.first_name || ""} ${p.mi || ""}`.trim();
                    if (n) displayName = n;
                }
            } else {
                const p = db.employerProfiles[email];
                if (p && p.contact_name) displayName = p.contact_name;
            }

            return ok({ success: true, user: { id: user.id, email: user.email }, displayName });
        },

        /* ─── Jobs ──────────────────────────────────────────── */
        getJobs(employerId) {
            const db = load();
            const jobs = employerId
                ? db.jobs.filter(j => j.employer_id == employerId)
                : db.jobs.slice();
            jobs.sort((a, b) => b.id - a.id);   // newest first
            return ok(jobs);
        },

        createJob(data) {
            const db = load();
            if (!data.title || !data.company) fail("Title and company are required");
            const job = {
                id: newId(db),
                employer_id: data.employerId,
                title: data.title,
                company: data.company,
                type: data.type || "internship",
                location: data.location || "Not specified",
                salary: data.salary || "Negotiable",
                description: data.description || "No description provided.",
                created_at: now()
            };
            db.jobs.push(job);
            save(db);
            return ok(job);
        },

        updateJob(jobId, description, salary) {
            const db = load();
            const job = db.jobs.find(j => j.id == jobId);
            if (!job) fail("Job not found");
            job.description = description;
            job.salary = salary;
            save(db);
            return ok(job);
        },

        deleteJob(jobId) {
            const db = load();
            db.jobs         = db.jobs.filter(j => j.id != jobId);
            db.applications = db.applications.filter(a => a.job_id != jobId);
            db.saved        = db.saved.filter(s => s.job_id != jobId);
            db.messages     = db.messages.filter(m => m.job_id != jobId);
            save(db);
            return ok({ success: true });
        },

        /* ─── Applications ──────────────────────────────────── */
        apply(jobId, studentEmail, studentName) {
            const db = load();
            const dup = db.applications.some(a => a.job_id == jobId && a.student_email === studentEmail);
            if (dup) fail("You already applied to this job");

            const app = {
                id: newId(db),
                job_id: Number(jobId),
                student_email: studentEmail,
                student_name: studentName || studentEmail,
                status: "Pending",
                applied_at: now()
            };
            db.applications.push(app);
            save(db);
            return ok(app);
        },

        getApplications(filter = {}) {
            const db = load();
            let list = db.applications.slice();

            if (filter.studentEmail) {
                list = list.filter(a => a.student_email === filter.studentEmail);
            }
            if (filter.employerId) {
                const myJobIds = db.jobs.filter(j => j.employer_id == filter.employerId).map(j => j.id);
                list = list.filter(a => myJobIds.includes(Number(a.job_id)));
            }
            list.sort((a, b) => b.id - a.id);
            return ok(list);
        },

        updateStatus(jobId, studentEmail, status) {
            const db = load();
            const app = db.applications.find(a => a.job_id == jobId && a.student_email === studentEmail);
            if (!app) fail("Application not found");
            app.status = status;
            save(db);
            return ok(app);
        },

        /* ─── Saved / bookmarked jobs ───────────────────────── */
        toggleSave(jobId, studentEmail) {
            const db = load();
            const i = db.saved.findIndex(s => s.job_id == jobId && s.student_email === studentEmail);
            let saved;
            if (i === -1) { db.saved.push({ job_id: Number(jobId), student_email: studentEmail }); saved = true; }
            else          { db.saved.splice(i, 1); saved = false; }
            save(db);
            return ok({ saved });
        },

        getSavedJobs(studentEmail) {
            const db = load();
            return ok(db.saved.filter(s => s.student_email === studentEmail).map(s => s.job_id));
        },

        /* ─── Interview messages ────────────────────────────── */
        getMessages(jobId, studentEmail) {
            const db = load();
            const msgs = db.messages
                .filter(m => m.job_id == jobId && m.student_email === studentEmail)
                .sort((a, b) => a.id - b.id);
            return ok(msgs);
        },

        sendMessage(jobId, studentEmail, sender, message) {
            const db = load();
            const msg = {
                id: newId(db),
                job_id: Number(jobId),
                student_email: studentEmail,
                sender,                  // "student" or "employer"
                message,
                created_at: now()
            };
            db.messages.push(msg);
            save(db);
            return ok(msg);
        },

        deleteMessage(msgId) {
            const db = load();
            db.messages = db.messages.filter(m => m.id != msgId);
            save(db);
            return ok({ success: true });
        },

        /* ─── Student profile ───────────────────────────────── */
        getStudentProfile(email) {
            const db = load();
            const p = db.studentProfiles[email] || {};
            const user = db.users.find(u => u.email === email);
            return ok(Object.assign({ full_name: user ? user.name : email }, p));
        },

        saveStudentProfile(d) {
            const db = load();
            db.studentProfiles[d.email] = {
                last_name:  d.lastName,
                first_name: d.firstName,
                mi:         d.mi,
                birthdate:  d.birthdate,
                age:        d.age,
                phone:      d.phone,
                address:    d.address,
                skills:     d.skills,
                course:     d.course,
                school:     d.school,
                bio:        d.bio
            };
            save(db);
            return ok({ success: true });
        },

        /* ─── Employer profile ──────────────────────────────── */
        getEmployerProfile(email) {
            const db = load();
            const p = db.employerProfiles[email] || {};
            const user = db.users.find(u => u.email === email);
            if (!p.contact_name && user) p.contact_name = user.name;
            return ok(p);
        },

        saveEmployerProfile(d) {
            const db = load();
            db.employerProfiles[d.email] = {
                company_name: d.companyName,
                industry:     d.industry,
                website:      d.website,
                description:  d.description,
                contact_name: d.contactName,
                phone:        d.phone,
                address:      d.address
            };
            save(db);
            return ok({ success: true });
        },

        /* Students view this by employer ID, not email */
        getEmployerPublic(employerId) {
            const db = load();
            const user = db.users.find(u => u.id == employerId);
            if (!user) return ok({});
            return ok(db.employerProfiles[user.email] || { contact_name: user.name });
        },

        /* ─── Utility: wipe everything and reseed demo data ──── */
        resetDemoData() {
            localStorage.removeItem(DB_KEY);
            seed();
            return ok({ success: true });
        }
    };

    window.api = api;
})();
