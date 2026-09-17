// ═══════════════════════════════════════════════
// CVC Hire — API client
// Put this file next to JobPortalscript.js and load it
// BEFORE JobPortalscript.js in every HTML page:
//   <script src="apiClient.js"></script>
//   <script src="JobPortalscript.js"></script>
// ═══════════════════════════════════════════════

// Change this if your project folder isn't at the XAMPP root.
// Example: if your files live in htdocs/cvc-hire/, this becomes
// "http://localhost/cvc-hire/api"
const API_BASE = "http://localhost/cvc-hire/api";

async function apiGet(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/${endpoint}${query ? "?" + query : ""}`);
    if (!res.ok) throw await res.json().catch(() => ({ error: res.statusText }));
    return res.json();
}

async function apiPost(endpoint, body = {}) {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw await res.json().catch(() => ({ error: res.statusText }));
    return res.json();
}

const api = {
    register:      (role, name, email, password) => apiPost("register.php", { role, name, email, password }),
    login:         (role, email, password)        => apiPost("login.php", { role, email, password }),

    getJobs:       (employerId = null)             => apiGet("jobs_list.php", employerId ? { employerId } : {}),
    createJob:     (job)                           => apiPost("job_create.php", job),
    updateJob:     (id, description, salary)       => apiPost("job_update.php", { id, description, salary }),
    deleteJob:     (id)                             => apiPost("job_delete.php", { id }),

    apply:         (jobId, studentEmail, studentName) => apiPost("application_apply.php", { jobId, studentEmail, studentName }),
    getApplications: (params)                       => apiGet("applications_list.php", params),
    updateStatus:  (jobId, studentEmail, status)    => apiPost("application_update_status.php", { jobId, studentEmail, status }),

    toggleSave:    (jobId, studentEmail)            => apiPost("save_job.php", { jobId, studentEmail }),
    getSavedJobs:  (studentEmail)                   => apiGet("saved_jobs_list.php", { studentEmail }),

    getStudentProfile: (email)                      => apiGet("profile_student.php", { email }),
    saveStudentProfile: (profile)                   => apiPost("profile_student.php", profile),

    getEmployerProfile: (email)                     => apiGet("profile_employer.php", { email }),
    saveEmployerProfile: (profile)                  => apiPost("profile_employer.php", profile),
    getEmployerPublic: (id)                         => apiGet("employer_public.php", { id }),

    getMessages:   (jobId, studentEmail)            => apiGet("messages.php", { jobId, studentEmail }),
    sendMessage:   (jobId, studentEmail, sender, message) => apiPost("messages.php", { jobId, studentEmail, sender, message }),
    deleteMessage: (id)                             => apiPost("message_delete.php", { id })
};
