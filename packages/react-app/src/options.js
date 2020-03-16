export const days = [];

export const hours = [];

export const minutes = [];

for (var i = 0; i < 366; i++) {
  days.push({
    id: i,
    title: i + " days"
  });
}

for (i = 0; i < 24; i++) {
  hours.push({
    id: i,
    title: i + " hours"
  });
}

for (i = 0; i < 60; i++) {
  minutes.push({
    id: i,
    title: i + " minutes"
  });
}
