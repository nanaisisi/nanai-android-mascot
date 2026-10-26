export function toggleMenu() {
	console.log("メニューボタンクリック");
	const dropdown = document.getElementById("dropdown");
	if (!dropdown) return;
	if (dropdown.classList.contains("show")) {
		dropdown.classList.remove("show");
		console.log("メニューを閉じました");
	} else {
		dropdown.classList.add("show");
		console.log("メニューを開きました");
	}
}

export function openModal(title) {
	console.log("モーダルを開きます:", title);
	const modalText = document.getElementById("modal-text");
	const modal = document.getElementById("modal");
	const dropdown = document.getElementById("dropdown");

	if (modalText) {
		modalText.textContent = `${title} の機能です`;
	}
	if (modal) {
		modal.classList.add("show");
	}
	if (dropdown) {
		dropdown.classList.remove("show");
	}
}

export function closeModal() {
	console.log("モーダルを閉じます");
	const modal = document.getElementById("modal");
	if (modal) {
		modal.classList.remove("show");
	}
}

// グローバルスコープに割り当て（HTMLのインラインonclick互換）
globalThis.toggleMenu = toggleMenu;
globalThis.openModal = openModal;
globalThis.closeModal = closeModal;

// メニュー外クリックで閉じる
document.addEventListener("click", (e) => {
	const dropdown = document.getElementById("dropdown");
	const menuBtn = document.querySelector(".menu-btn");

	if (dropdown && menuBtn) {
		if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
			dropdown.classList.remove("show");
		}
	}
});

// ESCキーでモーダルを閉じる
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		closeModal();
		const dropdown = document.getElementById("dropdown");
		if (dropdown) {
			dropdown.classList.remove("show");
		}
	}
});

console.log("メニューテストページが読み込まれました");
