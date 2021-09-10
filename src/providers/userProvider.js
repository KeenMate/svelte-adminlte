const users = [
  {
    userId: 1,
    username: "ltlusta",
    firstName: "Lenka",
    lastName: "Tlustá",
    gender: "female",
    birthDay: "21/03/1989"
  },
  {
    userId: 2,
    username: "pmokry",
    firstName: "Petr",
    lastName: "Mokrý",
    gender: "male",
    birthDay: "21/03/1989"
  },
  {
    userId: 3,
    username: "oztraceny",
    firstName: "Ondřej",
    lastName: "Ztracený",
    gender: "other",
    birthDay: "21/03/1989"
  },
];

const orders = [
  {
    userId: 1,
    orderId: 1,
    itemCount: 5,
    totalPrice: 12000,
    status: "Processing"
  },
  {
    userId: 1,
    orderId: 2,
    itemCount: 5,
    totalPrice: 12000,
    status: "Processing"
  },
  {
    userId: 2,
    orderId: 3,
    itemCount: 5,
    totalPrice: 12000,
    status: "Processing"
  },
  {
    userId: 2,
    orderId: 4,
    itemCount: 5,
    totalPrice: 12000,
    status: "Processing"
  },
  {
    userId: 2,
    orderId: 5,
    itemCount: 5,
    totalPrice: 12000,
    status: "Processing"
  },
  {
    userId: 3,
    orderId: 6,
    itemCount: 5,
    totalPrice: 12000,
    status: "Processing"
  },
]

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export async function getUsers(delay = 1000) {
  await sleep(delay);

  return users;
}

export async function getUser(id, delay = 1000) {
  await sleep(delay);

  return users.find(u => u.userId === id);
}

export async function getUserOrders(id, delay = 1000) {
  await sleep(delay);

  return orders.filter(o => o.userId === id);
}