/* Activities page: past/upcoming tabs and the activity-type filter.
   A card counts as upcoming when its <time datetime> is today or later,
   so adding a future activity needs no extra markup. */
(function () {
  'use strict';

  var root = document.querySelector('[data-activities]');
  if (!root) return;

  var controls = root.querySelector('.filters');
  var empty = root.querySelector('.empty-state');
  var cards = Array.prototype.slice.call(root.querySelectorAll('.card[data-type]'));
  var today = new Date().toISOString().slice(0, 10);
  var state = { when: 'past', type: 'all' };

  cards.forEach(function (card) {
    var time = card.querySelector('time[datetime]');
    card.dataset.when = time && time.getAttribute('datetime') >= today ? 'upcoming' : 'past';
  });

  function press(selector, attr, value) {
    root.querySelectorAll(selector).forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute(attr) === value));
    });
  }

  function render() {
    var shown = 0;
    cards.forEach(function (card) {
      var match = card.dataset.when === state.when && (state.type === 'all' || card.dataset.type === state.type);
      card.hidden = !match;
      if (match) shown += 1;
    });
    empty.hidden = shown > 0;
    press('[data-when-filter]', 'data-when-filter', state.when);
    press('[data-type-filter]', 'data-type-filter', state.type);
  }

  root.addEventListener('click', function (event) {
    var button = event.target.closest('[data-when-filter], [data-type-filter]');
    if (!button) return;
    if (button.hasAttribute('data-when-filter')) state.when = button.getAttribute('data-when-filter');
    else state.type = button.getAttribute('data-type-filter');
    render();
  });

  controls.hidden = false;
  render();
})();
