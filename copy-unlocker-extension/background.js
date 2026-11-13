const inactiveIcons = {
  16: "icons/gray-16.png",
  32: "icons/gray-32.png",
  48: "icons/gray-48.png",
  128: "icons/gray-128.png"
};

const activeIcons = {
  16: "icons/green-16.png",
  32: "icons/green-32.png",
  48: "icons/green-48.png",
  128: "icons/green-128.png"
};

const inactiveTitle = "解除复制限制";
const activeTitle = "复制限制已解除";

const setInactive = async (tabId) => {
  await chrome.action.setIcon({ tabId, path: inactiveIcons });
  await chrome.action.setTitle({ tabId, title: inactiveTitle });
};

const setActive = async (tabId) => {
  await chrome.action.setIcon({ tabId, path: activeIcons });
  await chrome.action.setTitle({ tabId, title: activeTitle });
};

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["unlock-copy.js"],
      world: "MAIN"
    });
    await setActive(tab.id);
  } catch (error) {
    await setInactive(tab.id);
    console.warn("Copy Unlocker failed:", error);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading" || changeInfo.url) {
    setInactive(tabId).catch((error) => {
      console.warn("Copy Unlocker reset failed:", error);
    });
  }
});
