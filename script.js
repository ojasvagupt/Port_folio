const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#nav-links");
const year = document.querySelector("#year");
const sections = [...document.querySelectorAll("main section[id]")];
const menuLinks = [...document.querySelectorAll(".nav-links a")];
const threeModulePromise = import("https://unpkg.com/three@0.165.0/build/three.module.js").catch(() => null);

year.textContent = new Date().getFullYear();

if (window.lucide) {
  window.lucide.createIcons();
}

const scrollToHashTarget = () => {
  if (!window.location.hash) {
    return;
  }

  const target = document.querySelector(window.location.hash);
  if (target) {
    window.setTimeout(() => {
      window.scrollTo({
        top: target.offsetTop,
        behavior: "smooth",
      });
    }, 120);
  }
};

scrollToHashTarget();
window.addEventListener("hashchange", scrollToHashTarget);

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.innerHTML = '<i data-lucide="menu"></i>';
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      menuLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -48% 0px", threshold: 0 }
);

sections.forEach((section) => navObserver.observe(section));

const initSpaceBackground = () => {
  const canvas = document.querySelector("#space-bg");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const stars = [];
  const starCount = 190;
  let width = 0;
  let height = 0;
  let rafId = 0;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * Math.min(window.devicePixelRatio, 2));
    canvas.height = Math.floor(height * Math.min(window.devicePixelRatio, 2));
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);

    stars.length = 0;
    for (let i = 0; i < starCount; i += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.35,
        alpha: Math.random() * 0.75 + 0.18,
        speed: Math.random() * 0.18 + 0.04,
        twinkle: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.78 ? "96, 231, 255" : "255, 255, 255",
      });
    }
  };

  const draw = (time = 0) => {
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createRadialGradient(width * 0.5, height * 0.58, 0, width * 0.5, height * 0.58, width * 0.7);
    gradient.addColorStop(0, "rgba(27, 141, 255, 0.06)");
    gradient.addColorStop(0.52, "rgba(25, 211, 255, 0.025)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    stars.forEach((star) => {
      const pulse = reduceMotion ? 1 : 0.65 + Math.sin(time * 0.0016 + star.twinkle) * 0.35;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${star.hue}, ${star.alpha * pulse})`;
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      if (!reduceMotion) {
        star.y += star.speed;
        star.x += Math.sin(time * 0.0004 + star.twinkle) * 0.05;
        if (star.y > height + 4) {
          star.y = -4;
          star.x = Math.random() * width;
        }
      }
    });

    rafId = window.requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
  window.addEventListener("beforeunload", () => window.cancelAnimationFrame(rafId));
};

const enableWidgetEffects = () => {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const widgets = document.querySelectorAll(
    ".service-card, .project-card, .education-card, .skill-group, .timeline-content, .quick-stats div"
  );

  widgets.forEach((widget) => widget.classList.add("tilt-card"));

  if (!canHover || reduceMotion) {
    return;
  }

  widgets.forEach((widget) => {
    widget.addEventListener("pointermove", (event) => {
      const rect = widget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 7;
      const rotateY = (x - 0.5) * 9;

      widget.style.setProperty("--glow-x", `${x * 100}%`);
      widget.style.setProperty("--glow-y", `${y * 100}%`);
      widget.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    widget.addEventListener("pointerleave", () => {
      widget.style.transform = "";
    });
  });
};

const makeScreenTexture = (THREE) => {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 1024;
  textureCanvas.height = 640;
  const ctx = textureCanvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 1024, 640);

  gradient.addColorStop(0, "#08111f");
  gradient.addColorStop(0.55, "#08203a");
  gradient.addColorStop(1, "#073627");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 640);

  ctx.fillStyle = "rgba(25, 211, 255, 0.18)";
  ctx.fillRect(70, 70, 884, 500);
  ctx.fillStyle = "rgba(8, 10, 24, 0.78)";
  ctx.fillRect(92, 96, 840, 452);

  ctx.font = "700 32px Poppins, Arial, sans-serif";
  ctx.fillStyle = "#19d3ff";
  ctx.fillText("ojasva.dev", 128, 160);
  ctx.font = "500 24px Menlo, Consolas, monospace";

  const lines = [
    ["terraform.apply(aks_stack);", "#f7f7fb"],
    ["helm.upgrade(production);", "#38e68f"],
    ["kubectl.scale(workloads);", "#19d3ff"],
    ["pipeline.deploy(zeroDowntime);", "#b8b9d6"],
    ["monitor(clusters, pods);", "#4fd6b4"],
  ];

  lines.forEach(([line, color], index) => {
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillText(String(index + 1).padStart(2, "0"), 128, 232 + index * 58);
    ctx.fillStyle = color;
    ctx.fillText(line, 190, 232 + index * 58);
  });

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const initComputerScene = async () => {
  const THREE = await threeModulePromise;
  const canvas = document.querySelector("#computer-canvas");
  const stage = document.querySelector(".computer-stage");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!THREE || !canvas || !stage) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 1.1, 7.2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = false;

  const group = new THREE.Group();
  group.rotation.x = -0.04;
  scene.add(group);

  const dark = new THREE.MeshStandardMaterial({
    color: "#15182f",
    roughness: 0.42,
    metalness: 0.42,
  });
  const edge = new THREE.MeshStandardMaterial({
    color: "#1b8dff",
    roughness: 0.32,
    metalness: 0.25,
    emissive: "#27135d",
    emissiveIntensity: 0.25,
  });
  const teal = new THREE.MeshStandardMaterial({
    color: "#19d3ff",
    roughness: 0.35,
    metalness: 0.2,
    emissive: "#0a6a5d",
    emissiveIntensity: 0.45,
  });
  const amber = new THREE.MeshStandardMaterial({
    color: "#38e68f",
    roughness: 0.4,
    metalness: 0.15,
    emissive: "#4f3200",
    emissiveIntensity: 0.32,
  });

  const addBox = (size, position, material, castShadow = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  addBox([3.8, 2.38, 0.22], [0, 0.8, 0], dark);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(3.25, 1.78),
    new THREE.MeshBasicMaterial({ map: makeScreenTexture(THREE) })
  );
  screen.position.set(0, 0.84, 0.126);
  group.add(screen);

  addBox([0.42, 0.82, 0.22], [0, -0.78, -0.02], edge);
  addBox([1.55, 0.18, 0.58], [0, -1.26, 0.08], dark);
  addBox([4.1, 0.18, 1.72], [0, -1.58, 0.74], dark);
  addBox([3.76, 0.08, 1.2], [0, -1.44, 0.5], edge, false);

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      const key = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.045, 0.16), col % 3 === 0 ? teal : amber);
      key.position.set(-1.45 + col * 0.32, -1.34, 0.2 + row * 0.26);
      key.castShadow = true;
      group.add(key);
    }
  }

  const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.046, 0.38), teal);
  trackpad.position.set(0, -1.335, 1.15);
  group.add(trackpad);

  const orbitGroup = new THREE.Group();
  group.add(orbitGroup);

  for (let i = 0; i < 18; i += 1) {
    const node = new THREE.Mesh(new THREE.SphereGeometry(i % 5 === 0 ? 0.045 : 0.028, 18, 18), i % 2 ? teal : amber);
    const angle = (Math.PI * 2 * i) / 18;
    node.position.set(Math.cos(angle) * 2.55, 0.25 + Math.sin(i) * 0.55, Math.sin(angle) * 1.55);
    orbitGroup.add(node);
  }

  const grid = new THREE.GridHelper(5.5, 16, "#19d3ff", "#17445f");
  grid.position.y = -1.72;
  grid.position.z = 0.2;
  grid.material.opacity = 0.25;
  grid.material.transparent = true;
  group.add(grid);

  scene.add(new THREE.HemisphereLight("#d8fff7", "#15182f", 2));
  const keyLight = new THREE.DirectionalLight("#ffffff", 2.4);
  keyLight.position.set(4, 6, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const screenLight = new THREE.PointLight("#19d3ff", 2.3, 8);
  screenLight.position.set(0, 1.1, 1.6);
  scene.add(screenLight);

  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.42;
    mouse.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.24;
  });

  stage.addEventListener("pointerleave", () => {
    mouse.x = 0;
    mouse.y = 0;
  });

  const resize = () => {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  resize();

  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    const elapsed = clock.getElapsedTime();
    target.x += (mouse.y - target.x) * 0.05;
    target.y += (mouse.x - target.y) * 0.05;

    group.rotation.x = -0.08 + target.x + (reduceMotion ? 0 : Math.sin(elapsed * 0.8) * 0.018);
    group.rotation.y = target.y + (reduceMotion ? 0 : Math.sin(elapsed * 0.55) * 0.16);
    group.position.y = reduceMotion ? 0 : Math.sin(elapsed * 1.2) * 0.07;
    orbitGroup.rotation.y = reduceMotion ? 0 : elapsed * 0.42;
    orbitGroup.rotation.x = reduceMotion ? 0.15 : Math.sin(elapsed * 0.5) * 0.22;

    renderer.render(scene, camera);
  });
};

const makeDarkSphereTexture = (THREE) => {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 1024;
  textureCanvas.height = 512;
  const ctx = textureCanvas.getContext("2d");
  const base = ctx.createLinearGradient(0, 0, 1024, 512);

  base.addColorStop(0, "#030817");
  base.addColorStop(0.45, "#08142c");
  base.addColorStop(0.78, "#101235");
  base.addColorStop(1, "#02040d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1024, 512);

  const patches = [
    [110, 170, 175, 76, "#17234b"],
    [280, 104, 118, 58, "#1d1a45"],
    [360, 260, 192, 84, "#122443"],
    [575, 166, 148, 62, "#1a214a"],
    [735, 250, 210, 86, "#111d3b"],
    [860, 126, 116, 52, "#20173f"],
  ];

  patches.forEach(([x, y, w, h, color], index) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.ellipse(x, y, w, h, index * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(27, 141, 255, 0.12)";
    ctx.fillRect(x - w * 0.42, y + h * 0.18, w * 0.62, 6);
  });

  for (let i = 0; i < 150; i += 1) {
    const x = Math.random() * 1024;
    const y = 250 + Math.random() * 210;
    ctx.fillStyle = `rgba(196, 181, 253, ${Math.random() * 0.28 + 0.12})`;
    ctx.fillRect(x, y, Math.random() * 2 + 0.7, Math.random() * 2 + 0.7);
  }

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const initContactGlobeScene = async () => {
  const THREE = await threeModulePromise;
  const canvas = document.querySelector("#contact-globe-canvas");
  const stage = document.querySelector(".contact-visual");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!THREE || !canvas || !stage) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.18, 8.6);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;

  const group = new THREE.Group();
  scene.add(group);

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1.82, 48, 48),
    new THREE.MeshStandardMaterial({
      map: makeDarkSphereTexture(THREE),
      roughness: 0.58,
      metalness: 0.16,
      emissive: "#03081a",
      emissiveIntensity: 0.18,
    })
  );
  globe.castShadow = true;
  globe.receiveShadow = true;
  group.add(globe);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.93, 48, 48),
    new THREE.MeshBasicMaterial({
      color: "#1c5d72",
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
    })
  );
  group.add(atmosphere);

  const ribbonMaterials = [
    new THREE.MeshStandardMaterial({ color: "#16395a", roughness: 0.58, metalness: 0.18, emissive: "#061627", emissiveIntensity: 0.16 }),
    new THREE.MeshStandardMaterial({ color: "#1d5b78", roughness: 0.54, metalness: 0.2, emissive: "#062237", emissiveIntensity: 0.18 }),
    new THREE.MeshStandardMaterial({ color: "#0d2b3a", roughness: 0.6, metalness: 0.14, emissive: "#05221e", emissiveIntensity: 0.12 }),
  ];
  const ringGroup = new THREE.Group();
  group.add(ringGroup);

  for (let i = 0; i < 9; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2 + i * 0.055, 0.035 + (i % 3) * 0.01, 10, 72),
      ribbonMaterials[i % ribbonMaterials.length]
    );
    ring.rotation.x = Math.PI / 2 + (i - 4) * 0.1;
    ring.rotation.y = (i - 4) * 0.18;
    ring.rotation.z = i * 0.38;
    ring.scale.set(1.14 + (i % 2) * 0.16, 0.72 + (i % 3) * 0.07, 1);
    ringGroup.add(ring);
  }

  const particles = new THREE.Group();
  group.add(particles);
  const particleMaterials = [
    new THREE.MeshBasicMaterial({ color: "#28c7f3" }),
    new THREE.MeshBasicMaterial({ color: "#2f7f9f" }),
    new THREE.MeshBasicMaterial({ color: "#44e19b" }),
  ];

  for (let i = 0; i < 52; i += 1) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(Math.random() * 0.015 + 0.008, 10, 10),
      particleMaterials[i % particleMaterials.length]
    );
    const radius = 2.6 + Math.random() * 2.5;
    const angle = Math.random() * Math.PI * 2;
    particle.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 3.6,
      Math.sin(angle) * radius
    );
    particles.add(particle);
  }

  scene.add(new THREE.HemisphereLight("#b9c3ff", "#030717", 1.35));
  const keyLight = new THREE.DirectionalLight("#d5dbff", 1.9);
  keyLight.position.set(4.5, 4.2, 5.8);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight("#1d5b78", 2.1, 10);
  rimLight.position.set(-3.5, 1.4, 3.4);
  scene.add(rimLight);

  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.45;
    mouse.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.28;
  });

  stage.addEventListener("pointerleave", () => {
    mouse.x = 0;
    mouse.y = 0;
  });

  const resize = () => {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  resize();

  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    const elapsed = clock.getElapsedTime();
    target.x += (mouse.y - target.x) * 0.05;
    target.y += (mouse.x - target.y) * 0.05;

    group.rotation.x = -0.12 + target.x;
    group.rotation.y = target.y + (reduceMotion ? 0 : Math.sin(elapsed * 0.25) * 0.08);
    globe.rotation.y = reduceMotion ? 0.25 : elapsed * 0.14;
    ringGroup.rotation.y = reduceMotion ? 0.3 : elapsed * 0.2;
    ringGroup.rotation.x = 0.2 + target.x * 0.5;
    particles.rotation.y = reduceMotion ? 0 : -elapsed * 0.05;

    renderer.render(scene, camera);
  });
};

initSpaceBackground();
enableWidgetEffects();
initComputerScene();
initContactGlobeScene();
