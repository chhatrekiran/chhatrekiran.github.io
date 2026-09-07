(() => {
  const tabBar = document.getElementById("tabBar");
  const tabContent = document.getElementById("tabContent");
  if (!tabBar || !tabContent) {
    return;
  }

  const pad3 = (number) => String(number).padStart(3, "0");

  function montageItems(tabKey, count, paddedIds = true) {
    return Array.from({ length: count }, (_, index) => {
      const number = index + 1;
      const id = pad3(number);
      return {
        id: "Case " + (paddedIds ? id : number),
        media: `assets/media/${tabKey}/${tabKey}_${id}.mp4`,
        condition: `assets/media/${tabKey}/${tabKey}_${id}_cond.png`
      };
    });
  }

  function pairedRealItems(count) {
    return Array.from({ length: count }, (_, index) => {
      const number = index + 1;
      const id = pad3(number);
      const firstVideo = pad3(index * 2 + 1);
      const secondVideo = pad3(index * 2 + 2);
      return {
        id: `Case ${number}`,
        condition: `assets/media/tab02/tab02_${id}_cond.png`,
        cells: [
          { kind: "video", src: `assets/media/tab02/tab02_${firstVideo}.mp4` },
          { kind: "video", src: `assets/media/tab02/tab02_${secondVideo}.mp4` }
        ]
      };
    });
  }

  const tabs = [
    {
      key: "tab01",
      label: "Real Videos Baseline Comparison",
      title: "Real Videos Baseline Comparison",
      type: "montage",
      topLabels: ["GT source video", "ATI result", "DaS result", "I2VEdit result"],
      bottomLabels: ["GWTF result", "VACE result", "WAN 2.1 T2V Prior result", "TrajectoryMover (Ours)"],
      pageSize: 4,
      items: montageItems("tab01", 8, false)
    },
    {
      key: "tab02",
      label: "Additional Real Videos",
      title: "Additional Real Videos",
      type: "paired",
      topLabels: [],
      bottomLabels: ["Source", "TrajectoryMover (Ours)"],
      pageSize: 5,
      items: pairedRealItems(4)
    },
    {
      key: "tab04",
      label: "Synthetic Video Baseline Comparison",
      title: "Synthetic Video Baseline Comparison",
      type: "montage",
      topLabels: ["GT source video", "ATI result", "DaS result", "I2VEdit result"],
      bottomLabels: ["SFM result", "VACE result", "TrajectoryMover (Ours)", ""],
      pageSize: 6,
      items: montageItems("tab04", 12)
    },
    {
      key: "tab05",
      label: "Additional Synthetic Videos",
      title: "Additional Synthetic Videos",
      type: "montage",
      topLabels: ["Displacement control signal", "Source", "Generated"],
      bottomLabels: [],
      pageSize: 5,
      items: montageItems("tab05", 23)
    },
    {
      key: "tab03",
      label: "TrajectorySynth (Original Data)",
      title: "TrajectorySynth (Original Data)",
      type: "montage",
      topLabels: [],
      bottomLabels: [
        "Source RGB",
        "Target RGB",
        "Source Segmentation Mask (Occlusion aware)",
        "Target Segmentation Mask (Occlusion aware)"
      ],
      pageSize: 6,
      items: montageItems("tab03", 18)
    },
    {
      key: "tab06",
      label: "Ablations",
      title: "Ablations",
      type: "montage",
      topLabels: ["GT source video", "TrajectoryMover (Ours)", "Drop-only"],
      bottomLabels: ["w/o scene mod.", "only scene mod.", "only primitives"],
      pageSize: 5,
      items: montageItems("tab06", 12)
    },
    {
      key: "tab07",
      label: "Backbone Transfer",
      title: "Backbone Transfer",
      type: "montage",
      topLabels: ["LTX source", "LTX target ref", "LTX result"],
      bottomLabels: [],
      pageSize: 5,
      items: montageItems("tab07", 5)
    }
  ];

  const pageState = new Map(tabs.map((tab) => [tab.key, 0]));

  function buildLabelRow(labels, extraClass = "") {
    if (!labels.length) {
      return null;
    }

    const row = document.createElement("div");
    row.className = `label-row ${extraClass}`.trim();
    row.style.gridTemplateColumns = `repeat(${labels.length}, minmax(0, 1fr))`;
    labels.forEach((label) => {
      const cell = document.createElement("div");
      cell.className = "label-cell";
      cell.innerHTML = label || "&nbsp;";
      row.appendChild(cell);
    });
    return row;
  }

  function unloadMedia(root) {
    root.querySelectorAll("video").forEach((video) => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    });
    root.querySelectorAll("img[data-src]").forEach((image) => image.removeAttribute("src"));
  }

  function loadMedia(root) {
    root.querySelectorAll("video[data-src]").forEach((video) => {
      video.src = video.dataset.src;
      video.load();
    });
    root.querySelectorAll("img[data-src]").forEach((image) => {
      image.src = image.dataset.src;
    });
  }

  function conditionBlock(item) {
    const wrap = document.createElement("div");
    wrap.className = "condition-wrap";
    const card = document.createElement("div");
    card.className = "condition-card";
    const label = document.createElement("div");
    label.className = "condition-label";
    label.textContent = "Condition signal";
    const image = document.createElement("img");
    image.className = "still-image";
    image.loading = "lazy";
    image.alt = `${item.id} condition signal`;
    image.dataset.src = item.condition;
    card.append(label, image);
    wrap.appendChild(card);
    return wrap;
  }

  function videoElement(source) {
    const video = document.createElement("video");
    video.className = "montage-video";
    video.controls = true;
    video.preload = "none";
    video.loop = true;
    video.playsInline = true;
    video.dataset.src = source;
    return video;
  }

  function resultCard(item, tab) {
    const card = document.createElement("article");
    card.className = "result-card";
    const title = document.createElement("h3");
    title.textContent = item.id;
    card.appendChild(title);
    card.appendChild(conditionBlock(item));

    const topLabels = buildLabelRow(tab.topLabels);
    if (topLabels) {
      card.appendChild(topLabels);
    }

    if (tab.type === "paired") {
      const grid = document.createElement("div");
      grid.className = "media-grid";
      item.cells.forEach((itemCell) => {
        const cell = document.createElement("div");
        cell.className = "media-cell";
        cell.appendChild(videoElement(itemCell.src));
        grid.appendChild(cell);
      });
      card.appendChild(grid);
    } else {
      card.appendChild(videoElement(item.media));
    }

    const bottomLabels = buildLabelRow(tab.bottomLabels, "bottom");
    if (bottomLabels) {
      card.appendChild(bottomLabels);
    }
    return card;
  }

  function renderTab(tabKey, updateHash = true) {
    const tab = tabs.find((entry) => entry.key === tabKey) || tabs[0];
    unloadMedia(tabContent);

    const pageCount = Math.max(1, Math.ceil(tab.items.length / tab.pageSize));
    const pageIndex = Math.min(pageState.get(tab.key) || 0, pageCount - 1);
    const start = pageIndex * tab.pageSize;
    const end = Math.min(start + tab.pageSize, tab.items.length);

    const head = document.createElement("div");
    head.className = "tab-head";
    const heading = document.createElement("h3");
    heading.textContent = tab.title;
    head.appendChild(heading);

    let pager = null;
    if (pageCount > 1) {
      pager = document.createElement("div");
      pager.className = "pager";
      pager.innerHTML = `
        <button type="button" class="pager-btn" data-page="previous" ${pageIndex === 0 ? "disabled" : ""}>Previous</button>
        <div class="pager-label">Page ${pageIndex + 1} / ${pageCount}</div>
        <button type="button" class="pager-btn" data-page="next" ${pageIndex >= pageCount - 1 ? "disabled" : ""}>Next</button>
      `;
    }

    const cards = document.createElement("div");
    cards.className = "cards";
    tab.items.slice(start, end).forEach((item) => cards.appendChild(resultCard(item, tab)));
    tabContent.replaceChildren(...[head, pager, cards].filter(Boolean));
    loadMedia(cards);

    pager?.querySelector('[data-page="previous"]')?.addEventListener("click", () => {
      pageState.set(tab.key, pageIndex - 1);
      renderTab(tab.key, false);
    });
    pager?.querySelector('[data-page="next"]')?.addEventListener("click", () => {
      pageState.set(tab.key, pageIndex + 1);
      renderTab(tab.key, false);
    });

    tabBar.querySelectorAll(".tab-btn").forEach((button) => {
      const active = button.dataset.key === tab.key;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    if (updateHash) {
      history.replaceState(null, "", `#${tab.key}`);
    }
  }

  tabs.forEach((tab) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-btn";
    button.dataset.key = tab.key;
    button.setAttribute("role", "tab");
    button.innerHTML = `<span class="tab-btn-label">${tab.label}</span>`;
    button.addEventListener("click", () => renderTab(tab.key));
    tabBar.appendChild(button);
  });

  const requestedTab = window.location.hash.slice(1);
  const initialTab = tabs.some((tab) => tab.key === requestedTab) ? requestedTab : tabs[0].key;
  renderTab(initialTab, false);
})();
