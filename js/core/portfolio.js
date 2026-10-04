/*
 * Assets: houses, cars, pets.
 *
 * Every year assets appreciate or decay, upkeep is charged, and mortgages
 * accrue interest. If upkeep cannot be met the cheapest thing gets sold off,
 * which is what makes owning a penthouse on a cashier's salary dangerous.
 */
const Portfolio = Object.freeze({
  totalUpkeep(game) {
    return game.assetsOf('h').reduce((s, a) => s + a.upkeep, 0) +
           game.assetsOf('c').reduce((s, a) => s + a.upkeep, 0) +
           game.pets().reduce((s, a) => s + a.upkeep, 0);
  },

  totalDebt(game) {
    return game.assets.reduce((s, a) => s + a.debt, 0);
  },

  /* House price for this player, scaled by where they live. */
  housePrice(game, def) {
    return Math.round(def.price * Cities.costMultiplier(game.birthCity));
  },

  buyHouse(game, def, { mortgage = 0 } = {}) {
    const price = Portfolio.housePrice(game, def);
    const down = Math.round(price * (1 - mortgage));
    if (!game.spend(down)) return { ok: false, text: `A ${def.name} costs ${Format.money(price)} down front.` };

    const asset = game.buy(def, { value: price, debt: price - down });
    game.setStat('happiness', 8);
    game.log(`You bought a ${def.name} for ${Format.money(price)}.`, 'assets');
    return { ok: true, text: `You bought a ${def.name} for ${Format.money(price)}.`, asset };
  },

  buyCar(game, def) {
    const price = Math.round(def.price * Cities.costMultiplier(game.birthCity));
    if (!game.spend(price)) return { ok: false, text: `A ${def.name} costs ${Format.money(price)}.` };

    const asset = game.buy(def);
    game.setStat('happiness', 4);
    game.log(`You bought a ${def.name} for ${Format.money(price)}.`, 'assets');
    return { ok: true, text: `You bought a ${def.name} for ${Format.money(price)}.`, asset };
  },

  adoptPet(game, def, petName) {
    const price = Math.round(def.price * Cities.costMultiplier(game.birthCity));
    if (!game.spend(price)) return { ok: false, text: `A ${def.name} costs ${Format.money(price)}.` };

    const name = petName?.trim() || game.rng.pick(['Biscuit', 'Mochi', 'Pepper', 'Bandit', 'Nugget', 'Ziggy', 'Shadow', 'Cleo', 'Muffin', 'Rusty']);
    const asset = game.buy(def);
    asset.petName = name;
    game.setStat('happiness', 6);
    game.legacy.petsOwned++;
    game.log(`You adopted a ${def.name} and named it ${name}.`, 'assets');
    return { ok: true, text: `You adopted a ${def.name}. You named it ${name}.`, asset };
  },

  sell(game, asset) {
    const proceeds = Math.round(asset.value);
    game.addMoney(proceeds);
    game.assets = game.assets.filter((a) => a.uid !== asset.uid);
    game.log(`You sold your ${asset.label} for ${Format.money(proceeds)}.`, 'assets');
    return `You sold your ${asset.label} for ${Format.money(proceeds)}.`;
  },

  /*
   * One year of ownership. Returns news lines for the age-up feed, or null.
   */
  tickYear(game) {
    const notes = [];

    for (const asset of game.assets) {
      const note = asset.tickYear(game.rng);
      if (note) notes.push(note.text);
    }

    const upkeep = Portfolio.totalUpkeep(game);
    if (upkeep > 0) {
      game.addMoney(-upkeep);

      // Cannot pay? Sell the cheapest non-pet asset to cover the gap.
      if (game.money < 0) {
        const sellable = game.assets.filter((a) => a.type !== 'p').toSorted((a, b) => a.value - b.value);
        while (game.money < 0 && sellable.length) {
          const victim = sellable.shift();
          notes.push(Portfolio.sell(game, victim));
        }
        if (game.money < 0) {
          game.addMoney(0);
          game.setStat('happiness', -10);
          notes.push('You could not keep up. Everything sold, and you still came up short.');
        }
      }
    }

    // Put spare cash into the mortgage rather than letting it compound.
    for (const house of game.assetsOf('h')) {
      if (house.debt > 0 && game.money > 20000) {
        const pay = house.payMortgage(Math.floor(game.money * 0.25));
        game.addMoney(-pay);
      }
    }

    if (notes.length) {
      game.log(`Upkeep and maintenance cost ${Format.money(upkeep)} this year.`, 'assets');
    }
    game.legacy.peakNetWorth = Math.max(game.legacy.peakNetWorth, game.netWorth());
    return notes;
  }
});