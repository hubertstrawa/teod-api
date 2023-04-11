const itemsToSell = [
  {
    _id: '63e57825740c52afc3339dbf',
    name: 'Mała mikstura zdrowia',
    description: 'Dodaje 50HP',
    image: '/items/POTIONS/POTION 1.png',
    state: 'common',
    type: 'eat',
    value: 100,
  },
  {
    _id: '6435c9902b8966851df8ac8b',
    name: 'Mała mikstura many',
    description: 'Dodaje 50MP',
    image: '/items/POTIONS/POTION 3.png',
    state: 'common',
    type: 'eat',
    value: 100,
  },
  {
    _id: '63e965bbecbb4c981ca98881',
    name: 'Wilczy Miecz',
    description: 'Zwyczajny miecz z drewnianą rękojeścią',
    image: '/items/SWORDS/SWORD 1.png',
    attack: 7,
    defense: 0,
    state: 'common',
    type: 'weapon',
    value: 650,
  },
  {
    _id: '642f422f4664fe165010d503',
    name: 'Topór Poruszenia',
    description: 'Wykuty przez kowali z plemienia Tainos',
    image: '/items/AXES/AXE 1.png',
    state: 'common',
    type: 'weapon',
    minLevel: 10,
    attack: 12,
    defense: 0,
    value: 2200,
    attributes: {
      strength: 2,
    },
  },
  {
    _id: '643475253fcef17a9c96b8f2',
    name: 'Drewniana Tarcza',
    description: 'Podstawowa tarcza wykonana z drewna',
    image: '/items/SHIELDS/SHIELD 1.png',
    attack: 0,
    defense: 9,
    state: 'common',
    type: 'shield',
    value: 180,
  },
  {
    _id: '64198dc4498996fb93e194b5',
    name: 'Kamien Przebudzenia',
    description: 'Dodaje 50 energii',
    image: '/items/STONES/STONE 4.png',
    state: 'common',
    type: 'eat',
    value: 500,
  },
  {
    _id: '642203b00e34982b4d3292e4',
    name: 'Pas natchnienia',
    description:
      'Zwyczajny pas wykonany ze skóry. Pobłogosławiony, dodający nieco max zdrowia.',
    image: '/items/BELTS/BELT 2.png',
    state: 'common',
    type: 'belt',
    attack: 0,
    defense: 2,
    value: 300,
    attributes: {
      vitality: 3,
    },
  },
  {
    _id: '642353e6483b9202619f6095',
    name: 'Księga czaru Błyskawica',
    description:
      'Dodaje zaklęcie Błyskawica lub zwiększa poziom nauczenia czaru',
    image: '/items/MAGIC BOOKS/MAGIC BOOK 3.png',
    state: 'rare',
    type: 'eat',
    attack: 0,
    defense: 0,
    learnSpell: 'Błyskawica',
    value: 1500,
  },
  {
    _id: '64329ab23fcef17a9c96b8e3',
    name: 'Księga czaru Ogniste Uderzenie',
    description:
      'Dodaje zaklęcie Ogniste Uderzenie lub zwiększa poziom nauczenia czaru',
    image: '/items/MAGIC BOOKS/MAGIC BOOK 2.png',
    state: 'rare',
    type: 'eat',
    attack: 0,
    defense: 0,
    learnSpell: 'Ogniste uderzenie',
    value: 1500,
  },
]

module.exports = itemsToSell

// name
// "Topór Poruszenia"
// description
// "Wykuty przez kowali pracujących dla plemienia Tainos"
// image
// "/items/AXES/AXE 1.png"
// attack
// 12
// minLevel
// 10

// attributes
// Object
// strength
// 2
// defense
// 0
// state
// "common"
// type
// "weapon"
// value
// 2200
