export async function fetchData(path) {
  const response = await fetch(`http://localhost:3000/${path}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error();
  }

  return data.places;
}

export async function updateUserplaces(places) {
  const response = await fetch('http://localhost:3000/user-places', {
    method: 'PUT',
    body: JSON.stringify({ places }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error();
  }

  return data.message;
}
