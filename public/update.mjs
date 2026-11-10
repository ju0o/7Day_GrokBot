/** Pure: show an update prompt only when this page is already controlled and a new worker is ready. First install must not prompt. */
export function shouldPromptUpdate({ hasController, workerReady } = {}) {
  return !!hasController && !!workerReady;
}
export const UPDATE_MESSAGE = '새 버전이 있어요. 새로고침하면 적용돼요.';
