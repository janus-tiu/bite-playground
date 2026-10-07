(() => {
  const root = document.getElementById('bite-gravity-study');
  root.querySelectorAll('[data-inbox-filter]').forEach(button => button.addEventListener('click', () => {
    root.querySelectorAll('[data-inbox-filter]').forEach(peer => peer.setAttribute('aria-pressed', String(peer === button)));
    const isFriends = button.dataset.inboxFilter === 'friends';
    root.querySelector('.ec-conversations').hidden = !isFriends;
    root.querySelector('.ec-inbox-empty').hidden = isFriends;
  }));
  root.querySelectorAll('[data-notification-filter]').forEach(button => button.addEventListener('click', () => {
    root.querySelectorAll('[data-notification-filter]').forEach(peer => peer.setAttribute('aria-pressed', String(peer === button)));
    const updates = button.dataset.notificationFilter === 'updates';
    root.querySelector('#ec-notification-heading').textContent = updates ? 'All quiet here' : 'No friend requests';
    root.querySelector('#ec-notification-description').textContent = updates ? 'This is where you’ll see updates like new game invites and accepted friend requests.' : 'When someone adds you, their friend request will appear here.';
  }));
  let showAll = false;
  const search = root.querySelector('#ec-player-search');
  const cards = [...root.querySelectorAll('[data-player]')];
  const updatePlayers = () => {
    const term = search.value.trim().toLowerCase();
    cards.forEach(card => { card.hidden = card.dataset.dismissed === 'true' || (!showAll && !term && card.hasAttribute('data-extra')) || !card.dataset.player.toLowerCase().includes(term); });
    root.querySelector('.ec-search-empty').hidden = cards.some(card => !card.hidden);
  };
  search.addEventListener('input', updatePlayers);
  root.querySelector('#ec-view-all').addEventListener('click', event => {
    showAll = !showAll;
    event.currentTarget.textContent = showAll ? 'Show less' : 'View all';
    event.currentTarget.setAttribute('aria-expanded', String(showAll));
    updatePlayers();
  });
  root.querySelectorAll('.ec-dismiss').forEach(button => button.addEventListener('click', () => {
    button.closest('[data-player]').dataset.dismissed = 'true'; updatePlayers();
  }));
  root.querySelectorAll('.ec-add-friend').forEach(button => button.addEventListener('click', () => {
    const sent = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(sent));
    button.querySelector('span').textContent = sent ? 'Request sent' : 'Add friend';
    button.setAttribute('aria-label', (sent ? 'Cancel friend request to ' : 'Add friend ') + button.closest('[data-player]').querySelector('strong').textContent);
  }));
  const banner = root.querySelector('.ec-platform-banner');
  banner.addEventListener('click', () => {
    const open = banner.getAttribute('aria-expanded') !== 'true';
    banner.setAttribute('aria-expanded', String(open));
    root.querySelector('.ec-platform-help').hidden = !open;
  });
  const list = root.querySelector('#ec-online-list');
  const originalOrder = [...list.children];
  root.querySelector('#ec-sort-friends').addEventListener('click', event => {
    const sorted = event.currentTarget.getAttribute('aria-pressed') !== 'true';
    event.currentTarget.setAttribute('aria-pressed', String(sorted));
    event.currentTarget.setAttribute('aria-label', sorted ? 'Restore friend order' : 'Sort friends by name');
    const order = sorted ? [...originalOrder].sort((a,b) => a.dataset.name.localeCompare(b.dataset.name)) : originalOrder;
    order.forEach(row => list.append(row));
  });
})();
