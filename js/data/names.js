/* Name pools used to populate the player's family and acquaintances. */
class Names {
  static MALE = Object.freeze([
    'James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Joseph',
    'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
    'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian',
    'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
    'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott',
    'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Alexander', 'Patrick', 'Frank',
    'Raymond', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam',
    'Nathan', 'Henry', 'Zachary', 'Douglas', 'Peter', 'Kyle', 'Noah', 'Ethan',
    'Jeremy', 'Walter', 'Christian', 'Keith', 'Roger', 'Terry', 'Austin', 'Sean',
    'Gerald', 'Carl', 'Harold', 'Dylan', 'Arthur', 'Lawrence', 'Jordan', 'Jesse',
    'Bryan', 'Billy', 'Bruce', 'Gabriel', 'Joe', 'Logan', 'Alan', 'Juan',
    'Albert', 'Willie', 'Elijah', 'Wayne', 'Randy', 'Mason', 'Vincent', 'Roy'
  ]);

  static FEMALE = Object.freeze([
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan',
    'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra',
    'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol',
    'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Laura', 'Sharon',
    'Cynthia', 'Kathleen', 'Amy', 'Shirley', 'Angela', 'Helen', 'Anna', 'Brenda',
    'Pamela', 'Nicole', 'Samantha', 'Katherine', 'Emma', 'Ruth', 'Christine',
    'Catherine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Virginia', 'Maria',
    'Heather', 'Diane', 'Julie', 'Joyce', 'Victoria', 'Kelly', 'Christina',
    'Joan', 'Evelyn', 'Lauren', 'Judith', 'Megan', 'Cheryl', 'Andrea', 'Hannah',
    'Martha', 'Jacqueline', 'Gloria', 'Teresa', 'Ann', 'Madison', 'Jean',
    'Abigail', 'Alexis', 'Olivia', 'Isabella', 'Chloe', 'Grace', 'Zoey',
    'Penelope', 'Layla', 'Aria', 'Scarlett', 'Camila', 'Luna', 'Nora', 'Hazel',
    'Aurora', 'Riley', 'Stella', 'Violet', 'Savannah', 'Brooklyn', 'Bella',
    'Claire', 'Skylar', 'Lucy', 'Paisley', 'Everly', 'Caroline', 'Sarah'
  ]);

  static LAST = Object.freeze([
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
    'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
    'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner',
    'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
    'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan',
    'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim',
    'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James',
    'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo'
  ]);

  static firstName(rng, gender) {
    return rng.pick(gender === 'female' ? Names.FEMALE : Names.MALE);
  }

  static lastName(rng) {
    return rng.pick(Names.LAST);
  }

  static fullName(rng, gender) {
    return `${Names.firstName(rng, gender)} ${Names.lastName(rng)}`;
  }
}