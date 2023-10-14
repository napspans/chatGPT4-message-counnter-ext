chrome.storage.local.get(['timestamps'], (result) => {
  const count = result.timestamps ? result.timestamps.length : 0;
  document.getElementById("count").textContent = count;
});
