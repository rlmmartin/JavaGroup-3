function saveTasksDummy() {
  const example = { title: "sample", done: false };
  localStorage.setItem("tasks", JSON.stringify(example));
  console.log("Dummy task saved.");
}

function loadTasksDummy() {
  const data = localStorage.getItem("tasks");
  console.log("Dummy loaded:", JSON.parse(data));
}

export { saveTasksDummy, loadTasksDummy };
