// Placeholder-only sample identities to make registering more fun
const identities = [
  { name: "Richie Richness", email: "swimmingincoins@goldvault.com" },
  { name: "Penny Pincher", email: "everycentcounts@couponclipper.org" },
  { name: "Count Cashula", email: "vampireminspending@midnightbanking.net" },
  { name: "Midas Touch", email: "everythingigold@solidwealth.io" },
  { name: "Justin Case", email: "rainydayfund@emergencyonly.com" },
  { name: "Bill Paymore", email: "too-many-subscriptions@brokemail.com" },
  { name: "Paige Turner", email: "readingthecharts@finliteracy.edu" },
  { name: "Max Balance", email: "alwaysmaxedout@savingshero.com" },
  { name: "Fiona Finance", email: "fiona@expertcapital.com" },
  { name: "Benny Bucks", email: "venmo-me@peer2peer.xyz" },
  { name: "Sally Saver", email: "retirementgoals2050@nestegg.org" },
  { name: "Charlie Ching", email: "cha-ching@moneycomic.net" },
];

export const pickPlaceholderIdentity = () =>
  identities[Math.floor(Math.random() * identities.length)];
