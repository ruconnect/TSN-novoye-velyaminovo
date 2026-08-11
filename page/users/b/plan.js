let project = {
  floors: []
};

let currentFloorId = null;
let selectedObjectId = null;
let zoom = 1;

const defaultObjects = {
  room: {
    name: "Комната",
    w: 180,
    h: 130,
    className: "room"
  },
  wall: {
    name: "Стена",
    w: 220,
    h: 18,
    className: "wall"
  },
  door: {
    name: "Дверь",
    w: 70,
    h: 16,
    className: "door"
  },
  window: {
    name: "Окно",
    w: 90,
    h: 14,
    className: "window"
  },
  well: {
    name: "Колодец",
    w: 90,
    h: 90,
    className: "well"
  },
  basement: {
    name: "Зона подвала",
    w: 240,
    h: 160,
    className: "basement"
  },
  cellar: {
    name: "Погреб",
    w: 180,
    h: 130,
    className: "cellar"
  },
  stairs: {
    name: "Лестница",
    w: 120,
    h: 180,
    className: "stairs"
  }
};

function uid() {
  return "id_" + Math.random().toString(36).slice(2, 11);
}

function init() {
  const firstFloor = {
    id: uid(),
    name: "1 этаж",
    type: "floor",
    objects: []
  };

  const basement = {
    id: uid(),
    name: "Подвал",
    type: "basement",
    objects: []
  };

  project.floors.push(firstFloor);
  project.floors.push(basement);
  currentFloorId = firstFloor.id;

  // Изменяем URL на /floppa через pushState
  window.history.pushState({}, '', '/floppa');

  renderAll();
}

function getCurrentFloor() {
  return project.floors.find(f => f.id === currentFloorId);
}

function getSelectedObject() {
  const floor = getCurrentFloor();
  if (!floor) return null;
  return floor.objects.find(o => o.id === selectedObjectId);
}

function addFloor() {
  const nameInput = document.getElementById("floorName");
  const typeInput = document.getElementById("floorType");

  const type = typeInput.value;
  const fallbackName = getFloorTypeName(type) + " " + (project.floors.length + 1);

  const floor = {
    id: uid(),
    name: nameInput.value.trim() || fallbackName,
    type,
    objects: []
  };

  project.floors.push(floor);
  currentFloorId = floor.id;
  selectedObjectId = null;
  nameInput.value = "";

  renderAll();
}

function deleteCurrentFloor() {
  if (project.floors.length <= 1) {
    alert("Нельзя удалить последний этаж.");
    return;
  }

  if (!confirm("Удалить текущий этаж со всеми объектами?")) return;

  project.floors = project.floors.filter(f => f.id !== currentFloorId);
  currentFloorId = project.floors[0].id;
  selectedObjectId = null;

  renderAll();
}

function selectFloor(id) {
  currentFloorId = id;
  selectedObjectId = null;
  renderAll();
}

function getFloorTypeName(type) {
  const map = {
    floor: "Этаж",
    basement: "Подвал",
    cellar: "Погреб",
    attic: "Мансарда",
    technical: "Технический этаж"
  };

  return map[type] || "Этаж";
}

function renderFloorList() {
  const list = document.getElementById("floorList");
  list.innerHTML = "";

  project.floors.forEach(floor => {
    const item = document.createElement("div");
    item.className = "floor-item" + (floor.id === currentFloorId ? " active" : "");
    item.onclick = () => selectFloor(floor.id);

    const name = document.createElement("span");
    name.textContent = floor.name;

    const type = document.createElement("span");
    type.className = "floor-type";
    type.textContent = getFloorTypeName(floor.type);

    item.appendChild(name);
    item.appendChild(type);
    list.appendChild(item);
  });
}

function renderCanvas() {
  const canvas = document.getElementById("canvas");
  canvas.innerHTML = "";
  canvas.style.transform = `scale(${zoom})`;

  const floor = getCurrentFloor();

  if (!floor) return;

  document.getElementById("currentFloorTitle").textContent =
    "Этаж: " + floor.name + " — " + getFloorTypeName(floor.type);

  floor.objects.forEach(obj => {
    const el = document.createElement("div");
    el.className = "object " + obj.className + (obj.id === selectedObjectId ? " selected" : "");
    el.style.left = obj.x + "px";
    el.style.top = obj.y + "px";
    el.style.width = obj.w + "px";
    el.style.height = obj.h + "px";
    el.style.transform = `rotate(${obj.rotate || 0}deg)`;
    el.dataset.id = obj.id;

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = obj.name;
    el.appendChild(label);

    const handle = document.createElement("div");
    handle.className = "resize-handle";
    el.appendChild(handle);

    el.addEventListener("mousedown", startDrag);
    handle.addEventListener("mousedown", startResize);

    el.onclick = function(e) {
      e.stopPropagation();
      selectedObjectId = obj.id;
      renderAll();
    };

    canvas.appendChild(el);
  });

  canvas.onclick = function() {
    selectedObjectId = null;
    renderAll();
  };
}

function addObject(type) {
  const floor = getCurrentFloor();

  if (!floor) return;

  const preset = defaultObjects[type];

  const obj = {
    id: uid(),
    type,
    name: preset.name,
    className: preset.className,
    x: 120,
    y: 120,
    w: preset.w,
    h: preset.h,
    rotate: 0,
    note: ""
  };

  floor.objects.push(obj);
  selectedObjectId = obj.id;

  renderAll();
}

function startDrag(e) {
  if (e.target.classList.contains("resize-handle")) return;

  e.preventDefault();
  e.stopPropagation();

  const id = this.dataset.id;
  selectedObjectId = id;

  const obj = getSelectedObject();

  const startX = e.clientX;
  const startY = e.clientY;
  const initialX = obj.x;
  const initialY = obj.y;

  function move(ev) {
    obj.x = Math.round(initialX + (ev.clientX - startX) / zoom);
    obj.y = Math.round(initialY + (ev.clientY - startY) / zoom);
    renderAll();
  }

  function up() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
  }

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
}

function startResize(e) {
  e.preventDefault();
  e.stopPropagation();

  const el = e.target.parentElement;
  const id = el.dataset.id;
  selectedObjectId = id;

  const obj = getSelectedObject();

  const startX = e.clientX;
  const startY = e.clientY;
  const initialW = obj.w;
  const initialH = obj.h;

  function move(ev) {
    obj.w = Math.max(20, Math.round(initialW + (ev.clientX - startX) / zoom));
    obj.h = Math.max(20, Math.round(initialH + (ev.clientY - startY) / zoom));
    renderAll();
  }

  function up() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
  }

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
}

function renderProperties() {
  const obj = getSelectedObject();

  const noSelection = document.getElementById("noSelection");
  const props = document.getElementById("objectProperties");

  if (!obj) {
    noSelection.style.display = "block";
    props.style.display = "none";
    return;
  }

  noSelection.style.display = "none";
  props.style.display = "block";

  document.getElementById("propName").value = obj.name;
  document.getElementById("propType").value = getObjectTypeName(obj.type);
  document.getElementById("propX").value = obj.x;
  document.getElementById("propY").value = obj.y;
  document.getElementById("propW").value = obj.w;
  document.getElementById("propH").value = obj.h;
  document.getElementById("propRotate").value = obj.rotate || 0;
  document.getElementById("propNote").value = obj.note || "";
}

function getObjectTypeName(type) {
  const map = {
    room: "Комната",
    wall: "Стена",
    door: "Дверь",
    window: "Окно",
    well: "Колодец",
    basement: "Зона подвала",
    cellar: "Погреб",
    stairs: "Лестница"
  };

  return map[type] || type;
}

function updateSelectedProperty(key, value) {
  const obj = getSelectedObject();

  if (!obj) return;

  if (["x", "y", "w", "h", "rotate"].includes(key)) {
    value = Number(value);
    if (Number.isNaN(value)) value = 0;
  }

  if (key === "w" || key === "h") {
    value = Math.max(20, value);
  }

  obj[key] = value;
  renderCanvas();
  renderStats();
}

function deleteSelectedObject() {
  const floor = getCurrentFloor();

  if (!floor || !selectedObjectId) return;

  floor.objects = floor.objects.filter(o => o.id !== selectedObjectId);
  selectedObjectId = null;

  renderAll();
}

function renderStats() {
  const floor = getCurrentFloor();
  const stats = document.getElementById("stats");

  if (!floor) {
    stats.innerHTML = "";
    return;
  }

  const total = floor.objects.length;
  const rooms = floor.objects.filter(o => o.type === "room").length;
  const wells = floor.objects.filter(o => o.type === "well").length;
  const basementZones = floor.objects.filter(o => o.type === "basement").length;
  const cellars = floor.objects.filter(o => o.type === "cellar").length;

  const roomArea = floor.objects
    .filter(o => o.type === "room" || o.type === "basement" || o.type === "cellar")
    .reduce((sum, o) => sum + o.w * o.h, 0);

  stats.innerHTML = `
    Тип этажа: ${getFloorTypeName(floor.type)}<br>
    Объектов: ${total}<br>
    Комнат: ${rooms}<br>
    Колодцев: ${wells}<br>
    Зон подвала: ${basementZones}<br>
    Погребов: ${cellars}<br>
    Условная площадь зон: ${Math.round(roomArea / 100)} м²
  `;
}

function zoomIn() {
  zoom = Math.min(2.5, zoom + 0.1);
  renderCanvas();
}

function zoomOut() {
  zoom = Math.max(0.3, zoom - 0.1);
  renderCanvas();
}

function resetZoom() {
  zoom = 1;
  renderCanvas();
}

function saveProject() {
  localStorage.setItem("housePlannerProject", JSON.stringify(project));
  alert("Проект сохранён в браузере.");
}

function loadProject() {
  const raw = localStorage.getItem("housePlannerProject");

  if (!raw) {
    alert("Сохранённый проект не найден.");
    return;
  }

  try {
    project = JSON.parse(raw);

    if (!project.floors || !project.floors.length) {
      throw new Error("Некорректный проект");
    }

    currentFloorId = project.floors[0].id;
    selectedObjectId = null;

    renderAll();
  } catch (e) {
    alert("Ошибка загрузки проекта.");
  }
}

function exportProject() {
  document.getElementById("jsonBox").value = JSON.stringify(project, null, 2);
}

function importProject() {
  const raw = document.getElementById("jsonBox").value;

  if (!raw.trim()) {
    alert("Вставьте JSON проекта.");
    return;
  }

  try {
    const imported = JSON.parse(raw);

    if (!imported.floors || !Array.isArray(imported.floors)) {
      throw new Error("Некорректный формат");
    }

    project = imported;
    currentFloorId = project.floors[0]?.id || null;
    selectedObjectId = null;

    renderAll();
  } catch (e) {
    alert("Не удалось импортировать JSON.");
  }
}

function clearProject() {
  if (!confirm("Полностью очистить проект?")) return;

  project = {
    floors: []
  };

  const floor = {
    id: uid(),
    name: "1 этаж",
    type: "floor",
    objects: []
  };

  project.floors.push(floor);
  currentFloorId = floor.id;
  selectedObjectId = null;

  renderAll();
}

function renderAll() {
  renderFloorList();
  renderCanvas();
  renderProperties();
  renderStats();
}

init();
