import "@testing-library/jest-dom/vitest";

// jsdom은 <dialog>의 showModal/close를 완전히 구현하지 않는다 → 테스트용 최소 폴리필.
HTMLDialogElement.prototype.showModal = function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close = function close() {
  this.open = false;
  this.dispatchEvent(new Event("close"));
};
