const audio = (() => {
  var instance = undefined;

  var getInstance = function () {
    if (!instance) {
      instance = new Audio();
      instance.autoplay = true;
      instance.src = document
        .getElementById("tombol-musik")
        .getAttribute("data-url");
      instance.load();
      instance.currentTime = 0;
      instance.volume = 1;
      instance.muted = false;
      instance.loop = true;
    }

    return instance;
  };

  return {
    play: function () {
      getInstance().play();
    },
    pause: function () {
      getInstance().pause();
    },
  };
})();

const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const salin = (btn) => {
  navigator.clipboard.writeText(btn.getAttribute("data-nomer"));
  let tmp = btn.innerHTML;
  btn.innerHTML = "Tersalin";
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = tmp;
    btn.disabled = false;
  }, 1500);
};

const timer = () => {
  var countDownDate = new Date(
    document
      .getElementById("tampilan-waktu")
      .getAttribute("data-waktu")
      .replace(" ", "T")
  ).getTime();
  var time = undefined;
  var distance = undefined;

  time = setInterval(() => {
    distance = countDownDate - new Date().getTime();

    if (distance < 0) {
      clearInterval(time);
      time = undefined;
      return;
    }

    document.getElementById("hari").innerText = Math.floor(
      distance / (1000 * 60 * 60 * 24)
    );
    document.getElementById("jam").innerText = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    document.getElementById("menit").innerText = Math.floor(
      (distance % (1000 * 60 * 60)) / (1000 * 60)
    );
    document.getElementById("detik").innerText = Math.floor(
      (distance % (1000 * 60)) / 1000
    );
  }, 1000);
};

const buka = async () => {
  document.getElementById("loading").style.display = "none";
  document.getElementById("tombol-musik").style.display = "block";
  audio.play();
  AOS.init();
  await login();
  timer();
};

const play = (btn) => {
  if (btn.getAttribute("data-status").toString() != "true") {
    btn.setAttribute("data-status", "true");
    audio.play();
    btn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
  } else {
    btn.setAttribute("data-status", "false");
    audio.pause();
    btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
  }
};

const resetForm = () => {
  document.getElementById("kirim").style.display = "block";
  document.getElementById("hadiran").style.display = "block";
  document.getElementById("labelhadir").style.display = "block";
  document.getElementById("batal").style.display = "none";
  document.getElementById("kirimbalasan").style.display = "none";
  document.getElementById("idbalasan").value = null;
  document.getElementById("balasan").innerHTML = null;
  document.getElementById("formnama").value = null;
  document.getElementById("hadiran").value = 0;
  document.getElementById("formpesan").value = null;
};

const balasan = async (button) => {
  button.disabled = true;
  let tmp = button.innerText;
  button.innerText = "Loading...";

  let id = button.getAttribute("data-uuid").toString();
  let token = localStorage.getItem("token") ?? "";

  if (token.length == 0) {
    alert("Terdapat kesalahan, token kosong !");
    window.location.reload();
    return;
  }

  const REQ = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };

  await fetch(
    document.querySelector("body").getAttribute("data-url") +
      "/api/comment/" +
      id,
    REQ
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.code == 200) {
        const BALAS = document.getElementById("balasan");
        BALAS.innerHTML = null;

        document.getElementById("kirim").style.display = "none";
        document.getElementById("hadiran").style.display = "none";
        document.getElementById("labelhadir").style.display = "none";
        document.getElementById("batal").style.display = "block";
        document.getElementById("kirimbalasan").style.display = "block";
        document.getElementById("idbalasan").value = id;

        BALAS.innerHTML = `
                <div class="card-body bg-light shadow p-2 my-2 rounded-4">
                    <div class="d-flex flex-wrap justify-content-between align-items-center">
                        <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                            <strong>${escapeHtml(res.data.nama)}</strong>
                        </p>
                        <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${
                          res.data.created_at
                        }</small>
                    </div>
                    <hr class="text-dark my-1">
                    <p class="text-dark m-0 p-0" style="white-space: pre-line">${escapeHtml(
                      res.data.komentar
                    )}</p>
                </div>`;
      }

      if (res.error.length != 0) {
        if (res.error[0] == "Expired token") {
          alert("Terdapat kesalahan, token expired !");
          window.location.reload();
          return;
        }

        alert(res.error[0]);
      }
    })
    .catch((err) => alert(err));

  document.getElementById("ucapan").scrollIntoView({ behavior: "smooth" });
  button.disabled = false;
  button.innerText = tmp;
};

const kirimBalasan = async () => {
  let nama = document.getElementById("formnama").value;
  let komentar = document.getElementById("formpesan").value;
  let token = localStorage.getItem("token") ?? "";
  let id = document.getElementById("idbalasan").value;

  if (token.length == 0) {
    alert("Terdapat kesalahan, token kosong !");
    window.location.reload();
    return;
  }

  if (nama.length == 0) {
    alert("nama tidak boleh kosong");
    return;
  }

  if (nama.length >= 35) {
    alert("panjangan nama maksimal 35");
    return;
  }

  if (komentar.length == 0) {
    alert("pesan tidak boleh kosong");
    return;
  }

  document.getElementById("batal").disabled = true;
  document.getElementById("kirimbalasan").disabled = true;
  let tmp = document.getElementById("kirimbalasan").innerHTML;
  document.getElementById(
    "kirimbalasan"
  ).innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

  const REQ = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      nama: nama,
      id: id,
      komentar: komentar,
    }),
  };

  let isSuccess = false;

  await fetch(
    document.querySelector("body").getAttribute("data-url") + "/api/comment",
    REQ
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.code == 201) {
        isSuccess = true;
      }

      if (res.error.length != 0) {
        if (res.error[0] == "Expired token") {
          alert("Terdapat kesalahan, token expired !");
          window.location.reload();
          return;
        }

        alert(res.error[0]);
      }
    })
    .catch((err) => alert(err));

  if (isSuccess) {
    await ucapan();
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
    resetForm();
  }

  document.getElementById("batal").disabled = false;
  document.getElementById("kirimbalasan").disabled = false;
  document.getElementById("kirimbalasan").innerHTML = tmp;
};

const remove_data = async (uuid) => {
  const element = document.getElementById(uuid);
  if (element) {
    // Send a DELETE request to the API to delete the comment
    const apiUrl = "https://undangan-api-gules.vercel.app"; // Replace with the correct API URL
    const response = await fetch(`${apiUrl}/comments/${uuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the deletion was successful
    if (response.ok) {
      element.remove();
    } else {
      console.error("Error deleting comment:", response.statusText);
    }
  }
};

const innerCard = (comment) => {
  let result = "";

  comment.forEach((data) => {
    result += `
        <div class="card-body border-start bg-light py-2 ps-2 pe-0 my-2 ms-3 me-0" id="${
          data.uuid
        }">
            <div class="d-flex flex-wrap justify-content-between align-items-center">
                <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                    <strong>${escapeHtml(data.nama)}</strong>
                </p>
                <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${
                  data.created_at
                }</small>
            </div>
            <hr class="text-dark my-1">
            <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${escapeHtml(
              data.komentar
            )}</p>
            <button style="font-size: 0.8rem;" onclick="balasan(this)" data-uuid="${
              data.uuid
            }" class="btn btn-sm btn-outline-dark rounded-4 py-0">Balas</button>
            <button style="font-size: 0.8rem;" onclick="remove_data('${
              data.uuid
            }')" class="btn btn-sm btn-outline-dark rounded-4 py-0">Hapus</button>
            ${innerCard(data.comment)}
        </div>`;
  });

  return result;
};

const renderCard = (data) => {
  const DIV = document.createElement("div");
  DIV.classList.add("mb-3");
  DIV.setAttribute("data-aos", "fade-up");
  DIV.innerHTML = `
    <div class="card-body bg-light shadow p-2 m-0 rounded-4" id="${data.uuid}">
        <div class="d-flex flex-wrap justify-content-between align-items-center">
            <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                <strong class="me-1">${escapeHtml(data.nama)}</strong>${
    data.hadir
      ? '<i class="fa-solid fa-circle-check text-success"></i>'
      : '<i class="fa-solid fa-circle-xmark text-danger"></i>'
  }
            </p>
            <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${
              data.created_at
            }</small>
        </div>
        <hr class="text-dark my-1">
        <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${escapeHtml(
          data.komentar
        )}</p>
        <button style="font-size: 0.8rem;" onclick="balasan(this)" data-uuid="${
          data.uuid
        }" class="btn btn-sm btn-outline-dark rounded-4 py-0">Balas</button>
        <button style="font-size: 0.8rem;" onclick="remove_data('${
          data.uuid
        }')" class="btn btn-sm btn-outline-dark rounded-4 py-0">Hapus</button>
        ${innerCard(data.comment)}
    </div>`;
  return DIV;
};

const ucapan = async () => {
  const UCAPAN = document.getElementById("daftarucapan");
  UCAPAN.innerHTML = `<div class="text-center"><span class="spinner-border spinner-border-sm me-1"></span>Loading...</div>`;
  let token = localStorage.getItem("token") ?? "";

  if (token.length == 0) {
    alert("Terdapat kesalahan, token kosong !");
    window.location.reload();
    return;
  }

  const REQ = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };

  await fetch(
    document.querySelector("body").getAttribute("data-url") + "/api/comment",
    REQ
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.code == 200) {
        UCAPAN.innerHTML = null;
        res.data.forEach((data) => UCAPAN.appendChild(renderCard(data)));

        if (res.data.length == 0) {
          UCAPAN.innerHTML = `<div class="h6 text-center">Tidak ada data</div>`;
        }
      }

      if (res.error.length != 0) {
        if (res.error[0] == "Expired token") {
          alert("Terdapat kesalahan, token expired !");
          window.location.reload();
          return;
        }

        alert(res.error[0]);
      }
    })
    .catch((err) => alert(err));
};

const login = async () => {
  document.getElementById(
    "daftarucapan"
  ).innerHTML = `<div class="text-center"><span class="spinner-border spinner-border-sm me-1"></span>Loading...</div>`;
  let body = document.querySelector("body");

  const REQ = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: body.getAttribute("data-email").toString(),
      password: body.getAttribute("data-password").toString(),
    }),
  };

  await fetch(body.getAttribute("data-url") + "/api/login", REQ)
    .then((res) => res.json())
    .then((res) => {
      if (res.code == 200) {
        localStorage.removeItem("token");
        localStorage.setItem("token", res.data.token);
        ucapan();
      }

      if (res.error.length != 0) {
        alert("Terdapat kesalahan, " + res.error[0]);
        window.location.reload();
        return;
      }
    })
    .catch(() => {
      alert("Terdapat kesalahan, otomatis reload halaman");
      window.location.reload();
      return;
    });
};

const kirim = async () => {
  let nama = document.getElementById("formnama").value;
  let hadir = document.getElementById("hadiran").value;
  let komentar = document.getElementById("formpesan").value;
  let token = localStorage.getItem("token") ?? "";

  if (token.length == 0) {
    alert("Terdapat kesalahan, token kosong !");
    window.location.reload();
    return;
  }

  if (nama.length == 0) {
    alert("nama tidak boleh kosong");
    return;
  }

  if (nama.length >= 35) {
    alert("panjangan nama maksimal 35");
    return;
  }

  if (hadir == 0) {
    alert("silahkan pilih kehadiran");
    return;
  }

  if (komentar.length == 0) {
    alert("pesan tidak boleh kosong");
    return;
  }

  document.getElementById("kirim").disabled = true;
  let tmp = document.getElementById("kirim").innerHTML;
  document.getElementById(
    "kirim"
  ).innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

  const REQ = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      nama: nama,
      hadir: hadir == 1,
      komentar: komentar,
    }),
  };

  await fetch(
    document.querySelector("body").getAttribute("data-url") + "/api/comment",
    REQ
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.code == 201) {
        resetForm();
        ucapan();
      }

      if (res.error.length != 0) {
        if (res.error[0] == "Expired token") {
          alert("Terdapat kesalahan, token expired !");
          window.location.reload();
          return;
        }

        alert(res.error[0]);
      }
    })
    .catch((err) => alert(err));

  document.getElementById("kirim").disabled = false;
  document.getElementById("kirim").innerHTML = tmp;
};

window.addEventListener(
  "load",
  () => {
    let modal = new bootstrap.Modal("#exampleModal");
    let name = new URLSearchParams(window.location.search).get("to") ?? "";

    if (name.length == 0) {
      document.getElementById("namatamu").remove();
    } else {
      let div = document.createElement("div");
      div.classList.add("m-2");
      div.innerHTML = `
        <p class="mt-0 mb-1 mx-0 p-0 text-light">Kepada Yth Bapak/Ibu/Saudara/i</p>
        <h2 class="text-light">${escapeHtml(name)}</h2>
        `;

      document.getElementById("formnama").value = name;
      document.getElementById("namatamu").appendChild(div);
    }

    modal.show();
  },
  false
);
