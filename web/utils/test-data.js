export const API_BASE_URL = 'https://sandbox.momsrecipes.fun/api';
export const UI_BASE_URL = 'https://sandbox.momsrecipes.fun';

export const ADMIN = {
  email: 'qa@mr.kg',
  password: process.env.ADMIN_PASSWORD
};

export const TEST_CUSTOMER = {
  id: 34971,
  phone: '+99123455678910',
  email: '+99123455678910@customer.customer',
  password: process.env.TEST_CUSTOMER_PASSWORD,
  name: 'Auto Test'
};

export const BONUS_RATES = {
  cash: 3,
  card: 3,
  welcome: 100,
  birthday: 300
};

export const DELIVERY = {
  freeDeliverySum: 2500,
  withinZone: { lat: 42.883595, lng: 74.573822 },
  outsideZone: { lat: 55.751244, lng: 37.618423 }
};

export const STORE = {  //// нужен для теста api/stores.spec.js
  id: 55,
    title: 'TEST_TEST',
    email: 'TESTtest@gmail.com',
    password: process.env.STORE_PASSWORD,
    coords: { lat: 42.8777895, lng: 74.6066926 }
  };

export const STORE_TEST = {
  id: 55,
  title: 'TEST_TEST',
  email: 'TESTtest@gmail.com',
  password: process.env.STORE_PASSWORD,
  coords: { lat: 42.86813265932593, lng: 74.60609436035158 }
};

export const PRODUCTS = {
  bonusCategoryIds: [15,25,14,13,22,23,21,20,26,16,18,52,17,63,64,33,65,69],
  bonusProductId: 4013,
  nonBonusProductId: 91,
  bonusProductPrice: 1500,
  nonBonusProductPrice: 1500
};

export const GIFT = {
  categoryId: 71,
  coefficient: 10,
  minSumForMamcoin: 1500,
  giftId: 3458
};

export const PAYMENT_METHODS = {
  cash: { key: 'nalicnye', guid: '09322f46-578a-d210-add7-eec222a08871' },
  card: { key: 'non-cash-payment', guid: '6a6a1d77-9f14-4d47-87f6-6fce4a9b3664' }
};

export const DELIVERY_ZONE = {
  storeId: 15,
  // Полигон зоны из ответа
  coords: [
    [42.85083076948964, 74.58139657974245],
    [42.85108246808863, 74.58096742630008],
    [42.85139708989493, 74.58113908767703],
    [42.85146001406393, 74.56440210342411],
    [42.85174317203079, 74.54749345779418],
    [42.851711710098606, 74.54697847366332],
    [42.84913177711737, 74.5450472831726],
    [42.848282263405885, 74.5442318916321],
    [42.84799908957244, 74.54401731491087],
    [42.84271293972887, 74.54371690750123],
    [42.83711164458745, 74.54354524612428],
    [42.82968442541629, 74.54324483871461],
    [42.82892906499064, 74.54320192337038],
    [42.82823664315816, 74.54350233078004],
    [42.82606490618796, 74.54478979110715],
    [42.82977884482043, 74.55560445785524],
    [42.82977884482045, 74.55989599227904],
    [42.82981031792308, 74.56337213516234],
    [42.82968442541629, 74.56899404525758],
    [42.82952705942225, 74.57774877548219],
    [42.829401166338464, 74.5850443840027],
    [42.83153737986332, 74.58509802818267],
    [42.85066559172705, 74.58614408969848]
  ],
  // Точка внутри зоны (пример из заказа)
  insidePoint: { lat: 42.874454503931, lng: 74.594421386719 },
  outsidePoint: { lat: 55.751244, lng: 37.618423 }
};
export const DELIVERY_STORE = {
  id: 15,
  title: 'Тыналиева 36',
  email: 'tynalieva36@momsrecipes.fun'
};


export const PRODUCTS_TEST = {
  syrnikiWithRaisins: {
    id: 188,
    count: 1
  }
};
//
