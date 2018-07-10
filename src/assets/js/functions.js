console.fancy = (pr, ...msgs) => {
  console.log(`%c[${pr}]%c ${msgs.join(' ')}`, 'color: #800080; font-weight: 800;', 'color: initial');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
