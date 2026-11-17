// Homework Digital Board - simple JavaScript (no libraries).
// Demo only: data is saved in localStorage, so it is NOT shared between phones.

// ----- 1. DATA -----
var students = [
  { roll : "01", name: "Muhammad Umar", father: "M. Naveedullah" },
  { roll: "02", name: "Muhammad Usman", father: "M. Naveedullah" },
  { roll: "03", name: "Waheed", father: "Abdul Hameed" }
];
var teachers = [
  { name: "Javaid Khan", subjects: ["Mathematics"] },
  { name: "Muhammad Saleem", subjects: ["Science"] },
  { name: "Samina Rashid", subjects: ["English", "Islamiat"] },
  { name: "M. Javed Saifi", subjects: ["Social Studies", "Urdu"] }
];
var allSubjects = ["Mathematics", "Science", "English", "Islamiat", "Social Studies", "Urdu"];
var statusText = { draft: "Draft", submitted: "Waiting for review", approved: "Approved", rejected: "Rejected", published: "Published" };

function dateFromToday(days) {
  var d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

var data = {
  homework: [
    { id: "s1", subject: "Mathematics", teacher: "Javaid Khan", title: "Sample: Exercise 5.2", instructions: "Demo only. Solve questions 1 to 6.", date: dateFromToday(0), due: dateFromToday(1), photo: "", status: "published", comment: "" },
    { id: "s2", subject: "English", teacher: "Samina Rashid", title: "Sample: Paragraph writing", instructions: "Demo only. Write 8 sentences.", date: dateFromToday(0), due: dateFromToday(2), photo: "", status: "published", comment: "" },
    { id: "s3", subject: "Science", teacher: "Muhammad Saleem", title: "Sample: Plant cell diagram", instructions: "Demo only. Label nucleus and cell wall.", date: dateFromToday(0), due: dateFromToday(2), photo: "", status: "submitted", comment: "" }
  ],
  done: {}
};

// ----- 2. SAVE AND LOAD -----
try {
  var saved = JSON.parse(localStorage.getItem("hdb-data"));
  if (saved) { data = saved; }
} catch (error) {
  // if loading fails we simply use the sample data above
}
function saveData() {
  try { localStorage.setItem("hdb-data", JSON.stringify(data)); }
  catch (error) { alert("Browser storage is full."); }
}

var newPhoto = "";   // compressed photo waiting in the form
function $(id) { return document.getElementById(id); }
function publishedList() { return data.homework.filter(function (h) { return h.status === "published"; }); }

// makes user text safe to show on the page (stops HTML injection)
function safe(text) {
  var p = document.createElement("p");
  p.textContent = text;
  return p.innerHTML.replace(/"/g, "&quot;");
}
function niceDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ----- 3. HOMEWORK CARD -----
function makeCard(h) {
  var pic = h.photo ? '<img src="' + h.photo + '" alt="' + safe(h.title) + '">' : "📄";
  return '<article class="card">' +
    '<div class="photo" data-view="' + h.id + '" role="button" tabindex="0">' + pic + '</div>' +
    '<div class="info">' +
    '<span class="tag">' + safe(h.subject) + '</span> <span class="tag ' + h.status + '">' + statusText[h.status] + '</span>' +
    '<h3>' + safe(h.title) + '</h3><p>' + safe(h.instructions) + '</p>' +
    '<small class="muted">Assigned: ' + niceDate(h.date) + '</small><br>' +
    '<small class="due">Due: ' + niceDate(h.due) + '</small>' +
    '</div></article>';
}
var emptyText = "<p>No homework has been published yet. Please check again later.</p>";

// ----- 4. SHOW EACH PAGE -----
function showHome() {
  $("home-count").textContent = "Published homework available: " + publishedList().length;
}

function showBoard() {
  var subject = $("f-subject").value;
  var date = $("f-date").value;
  var word = $("f-search").value.toLowerCase();
  var list = publishedList().filter(function (h) {
    return (!subject || h.subject === subject) && (!date || h.date === date) && h.title.toLowerCase().indexOf(word) !== -1;
  });
  $("board-list").innerHTML = list.length ? list.map(makeCard).join("") : emptyText;
}

function showParent() {
  var child = $("child").value;
  var list = publishedList();
  var stars = list.filter(function (h) { return data.done[child + h.id]; }).length;
  var cheer = ["Finish a homework to earn your first star!", "Nice work, keep going!", "Wonderful effort, Homework Star!"];
  var cheerNo = stars === 0 ? 0 : (stars >= 3 ? 2 : 1);
  $("stars-box").innerHTML = '<div class="stars">' + (stars ? "⭐".repeat(stars) : "☆") + '</div><p>Stars earned: ' + stars + '. ' + cheer[cheerNo] + '</p>';
  $("parent-list").innerHTML = list.length ? list.map(function (h) {
    var isDone = data.done[child + h.id];
    return '<div>' + makeCard(h) + '<button class="' + (isDone ? "ghost" : "") + '" data-done="' + h.id + '">' + (isDone ? "Done ✓" : "Mark as done") + '</button></div>';
  }).join("") : emptyText;
}

function currentTeacher() {
  return teachers.filter(function (t) { return t.name === $("teacher-pick").value; })[0];
}
function fillSubjectList() {
  $("hw-subject").innerHTML = currentTeacher().subjects.map(function (s) { return "<option>" + s + "</option>"; }).join("");
}
function showTeacher() {
  var mine = data.homework.filter(function (h) { return h.teacher === currentTeacher().name; });
  $("teacher-list").innerHTML = mine.map(function (h) {
    var extra = "";
    if (h.status === "rejected") { extra += '<p class="msg err">Reviewer comment: ' + safe(h.comment) + '</p>'; }
    if (h.status === "draft" || h.status === "rejected") {
      extra += '<button data-send="' + h.id + '">' + (h.status === "rejected" ? "Resubmit" : "Submit for Review") + '</button>';
    }
    return '<div>' + makeCard(h) + extra + '</div>';
  }).join("");
}

function showAdmin() {
  var waiting = data.homework.filter(function (h) { return h.status === "submitted"; });
  var approved = data.homework.filter(function (h) { return h.status === "approved"; });
  var counts = [[students.length, "Students"], [teachers.length, "Teachers"], [waiting.length, "Waiting for review"], [publishedList().length, "Published"]];
  $("admin-counts").innerHTML = counts.map(function (c) { return '<div class="card pad"><b>' + c[0] + '</b> ' + c[1] + '</div>'; }).join("");
  $("admin-queue").innerHTML = waiting.map(function (h) {
    return '<div>' + makeCard(h) + '<p class="muted">Teacher: ' + safe(h.teacher) + '</p>' +
      '<div class="row"><button data-approve="' + h.id + '">Approve</button><button class="red" data-reject="' + h.id + '">Reject</button></div></div>';
  }).join("") || "<p>Nothing waiting.</p>";
  $("admin-ready").innerHTML = approved.map(function (h) {
    return '<div>' + makeCard(h) + '<button data-publish="' + h.id + '">Publish</button></div>';
  }).join("") || "<p>Nothing approved yet.</p>";
  $("student-table").innerHTML = "<tr><th>Roll No.</th><th>Student</th><th>Father</th></tr>" +
    students.map(function (s) { return "<tr><td>" + s.roll + "</td><td>" + s.name + "</td><td>" + s.father + "</td></tr>"; }).join("");
  $("teacher-table").innerHTML = "<tr><th>Teacher</th><th>Subjects</th></tr>" +
    teachers.map(function (t) { return "<tr><td>" + t.name + "</td><td>" + t.subjects.join(", ") + "</td></tr>"; }).join("");
}

// ----- 5. PAGE SWITCHING (uses the # part of the address) -----
function showPage() {
  var name = location.hash.slice(1) || "home";
  if (!$(name)) { name = "home"; }
  document.querySelectorAll("main section").forEach(function (s) { s.classList.toggle("show", s.id === name); });
  document.querySelectorAll("#menu a").forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + name); });
  closeMenu();
  if (name === "home") { showHome(); }
  if (name === "board") { showBoard(); }
  if (name === "parent") { showParent(); }
  if (name === "teacher") { showTeacher(); }
  if (name === "admin") { showAdmin(); }
  window.scrollTo(0, 0);
}

// ----- 6. MOBILE MENU BUTTON -----
function closeMenu() {
  $("menu").classList.remove("open");
  $("menu-btn").setAttribute("aria-expanded", "false");
}
$("menu-btn").addEventListener("click", function () {
  var isOpen = $("menu").classList.toggle("open");
  $("menu-btn").setAttribute("aria-expanded", isOpen);
});

// ----- 7. TEACHER FORM -----
function say(text, good) {
  $("teacher-msg").textContent = text;
  $("teacher-msg").className = "msg " + (good ? "ok" : "err");
}

// makes the photo small (700px) so it loads fast on mobile data, but still readable
function shrinkPhoto(file, whenDone) {
  var reader = new FileReader();
  reader.onload = function () {
    var img = new Image();
    img.onload = function () {
      var scale = Math.min(1, 700 / Math.max(img.width, img.height));
      var canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      whenDone(canvas.toDataURL("image/jpeg", 0.65));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

$("hw-photo").addEventListener("change", function (e) {
  var file = e.target.files[0];
  var okTypes = ["image/jpeg", "image/png", "image/webp"];
  if (file && okTypes.indexOf(file.type) !== -1 && file.size < 8 * 1024 * 1024) {
    shrinkPhoto(file, function (url) {
      newPhoto = url;
      $("hw-preview").src = url;
      $("hw-preview").hidden = false;
    });
  } else {
    newPhoto = "";
    $("hw-preview").hidden = true;
    if (file) { say("Please choose a JPG, PNG or WebP photo under 8 MB.", false); }
  }
});

$("hw-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var status = e.submitter.value;           // "draft" or "submitted"
  var title = $("hw-title").value.trim();
  var ins = $("hw-ins").value.trim();
  if (title.length < 3) { return say("Title needs at least 3 characters.", false); }
  if (ins === "") { return say("Please write the instructions.", false); }
  if ($("hw-due").value < $("hw-date").value) { return say("Due date cannot be before the assignment date.", false); }
  if (status === "submitted" && newPhoto === "") { return say("Please add a photo before submitting.", false); }

  data.homework.unshift({
    id: "h" + Date.now(), subject: $("hw-subject").value, teacher: currentTeacher().name,
    title: title, instructions: ins, date: $("hw-date").value, due: $("hw-due").value,
    photo: newPhoto, status: status, comment: ""
  });
  saveData();
  $("hw-form").reset();
  newPhoto = "";
  $("hw-preview").hidden = true;
  setDates();
  say(status === "draft" ? "Draft saved." : "Submitted for review.", true);
  showTeacher();
});

function setDates() {
  $("hw-date").value = dateFromToday(0);
  $("hw-due").value = dateFromToday(1);
}

function changeStatus(id, newStatus, comment) {
  var h = data.homework.filter(function (x) { return x.id === id; })[0];
  h.status = newStatus;
  if (comment !== undefined) { h.comment = comment; }
  saveData();
  showPage();
}

// ----- 8. BUTTON CLICKS (one listener handles all buttons) -----
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-view],[data-done],[data-send],[data-approve],[data-reject],[data-publish]");
  if (!b) { return; }
  var d = b.dataset;
  if (d.view) {
    var h = data.homework.filter(function (x) { return x.id === d.view; })[0];
    $("popup").innerHTML = "<h2>" + safe(h.title) + "</h2>" + (h.photo ? '<img src="' + h.photo + '" alt="' + safe(h.title) + '">' : "") +
      "<p>" + safe(h.instructions) + '</p><p class="due">Due: ' + niceDate(h.due) + '</p><button onclick="this.closest(\'dialog\').close()">Close</button>';
    $("popup").showModal();
  } else if (d.done) {
    var key = $("child").value + d.done;
    data.done[key] = !data.done[key];
    saveData();
    showParent();
  } else if (d.send) { changeStatus(d.send, "submitted"); }
  else if (d.approve) { changeStatus(d.approve, "approved"); }
  else if (d.publish) { changeStatus(d.publish, "published"); }
  else if (d.reject) {
    var why = (prompt("Reason for rejection:") || "").trim();
    if (why) { changeStatus(d.reject, "rejected", why); }
  }
});

// ----- 9. START THE APP -----
$("f-subject").innerHTML += allSubjects.map(function (s) { return "<option>" + s + "</option>"; }).join("");
["f-subject", "f-date", "f-search"].forEach(function (id) { $(id).addEventListener("input", showBoard); });
$("child").innerHTML = students.map(function (s) { return '<option value="' + s.roll + '">' + s.name + " (Roll " + s.roll + ")</option>"; }).join("");
$("child").addEventListener("change", showParent);
$("teacher-pick").innerHTML = teachers.map(function (t) { return "<option>" + t.name + "</option>"; }).join("");
$("teacher-pick").addEventListener("change", function () { fillSubjectList(); showTeacher(); });
fillSubjectList();
setDates();
window.addEventListener("hashchange", showPage);
showPage();
