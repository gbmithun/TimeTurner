const fs = require('fs');
const path = require('path');

// Path to watches.json
const watchesPath = path.join(__dirname, 'watches.json');

// Mock function to generate random hex color
function randomHexColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

// Mock data for demonstration
const mockWatches = [
  {
    id: 1,
    title: "Rolex Submariner",
    brand: "Rolex",
    movement: "Automatic",
    strap: "Metal",
    material: "Steel",
    complications: ["Date"],
    dialColor: "#000000",
    waterResistance: "300m",
    price: 9500,
    image: "https://example.com/images/rolex-submariner.jpg"
  },
  {
    id: 2,
    title: "Omega Speedmaster Moonwatch",
    brand: "Omega",
    movement: "Mechanical",
    strap: "Leather",
    material: "Steel",
    complications: ["Chronograph"],
    dialColor: "#222222",
    waterResistance: "50m",
    price: 6500,
    image: "https://example.com/images/omega-speedmaster.jpg"
  },
  {
    id: 3,
    title: "Seiko Presage",
    brand: "Seiko",
    movement: "Automatic",
    strap: "Leather",
    material: "Steel",
    complications: [],
    dialColor: "#ffffff",
    waterResistance: "100m",
    price: 450,
    image: "https://example.com/images/seiko-presage.jpg"
  },
  {
    id: 4,
    title: "Patek Philippe Nautilus",
    brand: "Patek Philippe",
    movement: "Automatic",
    strap: "Metal",
    material: "Steel",
    complications: ["Date", "Moonphase"],
    dialColor: "#1a237e",
    waterResistance: "120m",
    price: 30000,
    image: "https://example.com/images/patek-nautilus.jpg"
  },
  {
    id: 5,
    title: "Audemars Piguet Royal Oak",
    brand: "Audemars Piguet",
    movement: "Automatic",
    strap: "Metal",
    material: "Steel",
    complications: ["Date"],
    dialColor: "#37474f",
    waterResistance: "50m",
    price: 25000,
    image: "https://example.com/images/ap-royal-oak.jpg"
  }
];

// Optionally, you could "fetch" or generate more