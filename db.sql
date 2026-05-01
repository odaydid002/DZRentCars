

-- ENUM types
CREATE TYPE fuel_type AS ENUM ('Petrol', 'Diesel', 'Electric', 'Hybrid', 'Gasoline', 'Natural', 'LGP', 'E85');
CREATE TYPE transmission_type AS ENUM ('Manual', 'Automatic');
CREATE TYPE body_type AS ENUM ('Sport', 'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Off-Road', 'Truck', 'Van');
CREATE TYPE user_roles AS ENUM ('Admin', 'Employe', 'Client');
CREATE TYPE css_color AS ENUM (
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen'
);

-- Tabels------------------------------------------------------------------------------

-- Office
CREATE TABLE office (
  id SERIAL PRIMARY KEY,
  country VARCHAR(20) NOT NULL,
  wilaya VARCHAR(30) NOT NULL,
  city VARCHAR(30) NOT NULL,
  address VARCHAR(50) NOT NULL,
  open_time TIME DEFAULT '08:00:00',
  close_time TIME DEFAULT '22:00:00',
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL
);

-- Users table
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email VARCHAR(100) UNIQUE NOT NULL,
	username VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	fname VARCHAR(20) NOT NULL,
	lname VARCHAR(20) NOT NULL,
  sexe CHAR(1) NOT NULL,
	address VARCHAR(30) NOT NULL,
	country VARCHAR(30) NOT NULL DEFAULT 'Algeria',
	wilaya VARCHAR(30) NOT NULL,
	city VARCHAR(30) NOT NULL,
	zipcode VARCHAR(10) NOT NULL,
	image VARCHAR(255) NOT NULL DEFAULT '/assets/images/user.jpg',
	phone VARCHAR(20) UNIQUE NOT NULL,
	account_status BOOLEAN NOT NULL DEFAULT FALSE,
	phone_status BOOLEAN NOT NULL DEFAULT FALSE,
	birthdate DATE NOT NULL,
	role user_roles NOT NULL DEFAULT 'Client',
  	office_id INT REFERENCES office(id) ON DELETE SET NULL DEFAULT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users documents
CREATE TABLE users_documents (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	image_front VARCHAR(255) NOT NULL,
	image_back VARCHAR(255) NOT NULL,
	upload_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users_verification (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_doc INTEGER NOT NULL REFERENCES users_documents(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reason VARCHAR(100),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User tokens
CREATE TABLE user_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- Brands
CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  logo VARCHAR(255) NOT NULL DEFAULT '/assets/cars/default_logo.png',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  model VARCHAR(30) NOT NULL,
  fab_year SMALLINT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  color VARCHAR(20) NOT NULL,
  capacity SMALLINT NOT NULL DEFAULT 4,
  doors SMALLINT NOT NULL DEFAULT 4,
  fuel fuel_type NOT NULL,
  transmission transmission_type NOT NULL,
  body body_type NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  speed SMALLINT NOT NULL DEFAULT 0,
  horsepower SMALLINT NOT NULL DEFAULT 0,
  engine_type VARCHAR(20) NOT NULL DEFAULT 'unknown',
  rental_type VARCHAR(2) NOT NULL DEFAULT 'h',
  image VARCHAR(255) NOT NULL DEFAULT '/assets/cars/default.png',
  prevImage1 VARCHAR(255) NOT NULL DEFAULT '/assets/cars/default_prev.png',
  prevImage2 VARCHAR(255) NOT NULL DEFAULT '/assets/cars/default_prev.png',
  prevImage3 VARCHAR(255) NOT NULL DEFAULT '/assets/cars/default_prev.png',
  description VARCHAR(255) NOT NULL DEFAULT 'There is no description for this car.',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rentals
CREATE TABLE rentals (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  insurance DECIMAL(10,2) NOT NULL DEFAULT 0.0,
  fees DECIMAL(10,2) NOT NULL DEFAULT 0.0,
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE returns (
  id SERIAL PRIMARY KEY,
  rental_id INT REFERENCES rentals(id) ON DELETE SET NULL,
  return_fees DECIMAL(10,2) NOT NULL DEFAULT 0.0,
  return_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  rental_id INT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  review TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wilaya & City tables
CREATE TABLE wilaya (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE city (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  zip_code VARCHAR(5) NOT NULL,
  wilaya_id INT NOT NULL REFERENCES wilaya(id) ON DELETE CASCADE
);

CREATE TABLE features (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE vehicle_features (
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  feature_id INT NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (vehicle_id, feature_id)
);

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,                              
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,     
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE, 
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, vehicle_id)                      
);

CREATE TABLE vehicle_stock (
  stock_id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  office_id INT NOT NULL REFERENCES office(id) ON DELETE CASCADE,
  disabled SMALLINT NOT NULL DEFAULT 0,
  units SMALLINT NOT NULL CHECK (units >= 0)
);

CREATE TABLE newbie (
  id SERIAL NOT NULL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  navbar BOOLEAN DEFAULT FALSE,
  home BOOLEAN DEFAULT FALSE,
  orders BOOLEAN DEFAULT FALSE,
  profile BOOLEAN DEFAULT FALSE,
  vehicles BOOLEAN DEFAULT FALSE
);

CREATE TABLE log_login (
  id SERIAL PRIMARY KEY,             
  email VARCHAR(255) NOT NULL,
  status BOOLEAN NOT NULL,  
  platform VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE banned_users (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    reason TEXT,
    banned_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INT NULL REFERENCES users(id) ON DELETE SET NULL DEFAULT NULL,
  type VARCHAR NOT NULL DEFAULT 'general',
  priority VARCHAR(50) NOT NULL DEFAULT 'normal',
  vehicle_id INT NULL REFERENCES vehicles(id) ON DELETE SET NULL DEFAULT NULL,
  description VARCHAR(255) NOT NULL DEFAULT 'No description',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'Coupon',
  description VARCHAR(255) NOT NULL DEFAULT 'coupon',
  code VARCHAR(30) UNIQUE NOT NULL,
  value INTEGER NOT NULL,
  usage_limit INT DEFAULT 1,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promo (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'Discount',
  description VARCHAR(255) NOT NULL DEFAULT 'Discount',
  value INTEGER NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coupons_use (
  id SERIAL PRIMARY KEY,
  coupon_id INT REFERENCES coupons(id),
  user_id INT REFERENCES users(id),
  used_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE paycard (
    id SERIAL PRIMARY KEY,         
    user_id INT REFERENCES users(id) NOT NULL,                           
    type VARCHAR(20) NOT NULL,      
    card_number VARCHAR(20) NOT NULL UNIQUE,      
    holder VARCHAR(255) NOT NULL,          
    exp_date DATE NOT NULL,                  
    cvv VARCHAR(4) NOT NULL,                  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE invoice (
  id SERIAL PRIMARY KEY,
  bill_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  rental_id INTEGER REFERENCES rentals(id) ON DELETE SET NULL,
  payment_methode SMALLINT DEFAULT 2,
  paycard_id INT REFERENCES paycard(id) ON DELETE SET NULL,
  discounts JSONB,
  additions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes--------------------------------------------------------------
CREATE INDEX idx_reviews_vehicle ON reviews(vehicle_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rental ON reviews(rental_id);
CREATE INDEX idx_rentals_vehicle ON rentals(vehicle_id);
CREATE INDEX idx_rentals_user ON rentals(user_id);
CREATE INDEX idx_vehicles_brand ON vehicles(brand_id);
CREATE INDEX idx_vehicles_model ON vehicles(model);
CREATE INDEX idx_vehicles_engine_type ON vehicles(engine_type);
CREATE INDEX idx_vehicles_speed ON vehicles(speed);
CREATE INDEX idx_vehicles_horsepower ON vehicles(horsepower);
CREATE INDEX idx_vehicle_features_vehicle_id ON vehicle_features(vehicle_id);
CREATE INDEX idx_vehicle_features_feature_id ON vehicle_features(feature_id);
CREATE INDEX idx_vehicle_features_combo ON vehicle_features(vehicle_id, feature_id);
CREATE INDEX idx_favorites_added_at ON favorites(added_at);

CREATE OR REPLACE FUNCTION insert_new_user_into_newbie()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO newbie (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION insert_new_user_into_newbie();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users_verification
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


--Inserts------------------------------------------------------------------

INSERT INTO wilaya (name) VALUES 
('Adrar'), ('Chlef'), ('Laghouat'), ('Oum El Bouaghi'), ('Batna'), ('Béjaïa'), ('Biskra'), ('Béchar'), ('Blida'), ('Bouira'),
('Tamanrasset'), ('Tébessa'), ('Tlemcen'), ('Tiaret'), ('Tizi Ouzou'), ('Algiers'), ('Djelfa'), ('Jijel'), ('Sétif'), ('Saïda'),
('Skikda'), ('Sidi Bel Abbès'), ('Annaba'), ('Guelma'), ('Constantine'), ('Médéa'), ('Mostaganem'), ('MSila'), ('Mascara'), ('Ouargla'),
('Oran'), ('El Bayadh'), ('Illizi'), ('Bordj Bou Arréridj'), ('Boumerdès'), ('El Tarf'), ('Tindouf'), ('Tissemsilt'), ('El Oued'), ('Khenchela'),
('Souk Ahras'), ('Tipaza'), ('Mila'), ('Aïn Defla'), ('Naâma'), ('Aïn Témouchent'), ('Ghardaïa'), ('Relizane'), ('Timimoun'), ('Bordj Badji Mokhtar'),
('Ouled Djellal'), ('Béni Abbès'), ('In Salah'), ('In Guezzam'), ('Touggourt'), ('Djanet'), ('El MGhair'), ('El Meniaa');

INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Adrar', 1, '01000'), ('Tamest', 1, '01001'), ('Zaouiet Kounta', 1, '01002'), ('Aoulef', 1, '01003'), ('Charouine', 1, '01004'), ('Reggane', 1, '01005'), ('In Zghmir', 1, '01006'), ('Tit', 1, '01007'), ('Tsabit', 1, '01008'), ('Ouled Ahmed Timmi', 1, '01009'), ('Bouda', 1, '01010');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Chlef', 2, '02000'), ('Ténès', 2, '02001'), ('Benairia', 2, '02002'), ('El Karimia', 2, '02003'), ('Oued Fodda', 2, '02004'), ('Ouled Fares', 2, '02005'), ('Zeboudja', 2, '02006'), ('Boukadir', 2, '02007'), ('Beni Haoua', 2, '02008'), ('Talassa', 2, '02009'), ('Harchoun', 2, '02010'), ('Ouled Abbes', 2, '02011'), ('El Marsa', 2, '02012'), ('Chettia', 2, '02013'), ('Sidi Akkacha', 2, '02014'), ('Taougrit', 2, '02015'), ('Abou El Hassen', 2, '02016'), ('El Hadjadj', 2, '02017'), ('Labiod Medjadja', 2, '02018'), ('Oued Sly', 2, '02019'), ('Herenfa', 2, '02020'), ('Ouled Ben Abdelkader', 2, '02021'), ('Sendjas', 2, '02022'), ('Sidi Abderrahmane', 2, '02023'), ('Beni Rached', 2, '02024'), ('Oum Drou', 2, '02025'), ('Breira', 2, '02026'), ('Beni Bouateb', 2, '02027');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Laghouat', 3, '03000'), ('Ksar El Hirane', 3, '03001'), ('Benacer Ben Chohra', 3, '03002'), ('Hassi Delaa', 3, '03003'), ('Hassi R''Mel', 3, '03004'), ('Ain Madhi', 3, '03005'), ('Tadjemout', 3, '03006'), ('Kheneg', 3, '03007'), ('Gueltat Sidi Saad', 3, '03008'), ('Ain Sidi Ali', 3, '03009'), ('Beidha', 3, '03010'), ('Brida', 3, '03011'), ('El Ghicha', 3, '03012'), ('Hadj Mechri', 3, '03013'), ('Oued Morra', 3, '03014'), ('Tadjrouna', 3, '03015'), ('Taouiala', 3, '03016');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Oum El Bouaghi', 4, '04000'), ('Ain Beida', 4, '04001'), ('Ain Babouche', 4, '04002'), ('Ain Diss', 4, '04003'), ('Ain Fakroun', 4, '04004'), ('Ain Kercha', 4, '04005'), ('Ain M''Lila', 4, '04006'), ('Ain Zitoun', 4, '04007'), ('Behir Chergui', 4, '04008'), ('Berriche', 4, '04009'), ('Bir Chouhada', 4, '04010'), ('Dhalaa', 4, '04011'), ('El Amiria', 4, '04012'), ('El Belala', 4, '04013'), ('El Djazia', 4, '04014'), ('El Fedjoudj', 4, '04015'), ('El Harmilia', 4, '04016'), ('Fkirina', 4, '04017'), ('Hanchir Toumghani', 4, '04018'), ('Ksar Sbahi', 4, '04019'), ('Meskiana', 4, '04020'), ('Oued Nini', 4, '04021'), ('Ouled Gacem', 4, '04022'), ('Ouled Hamla', 4, '04023'), ('Ouled Zouai', 4, '04024'), ('Rahia', 4, '04025'), ('Sigus', 4, '04026'), ('Souk Naamane', 4, '04027'), ('Zorg', 4, '04028');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Batna', 5, '05000'), ('Merouana', 5, '05001'), ('Seriana', 5, '05002'), ('M''Doukal', 5, '05003'), ('Barika', 5, '05004'), ('Djezzar', 5, '05005'), ('Timgad', 5, '05006'), ('Ras El Aioun', 5, '05007'), ('N''Gaous', 5, '05008'), ('Ouled Selam', 5, '05009'), ('Tazoult', 5, '05010'), ('Arris', 5, '05011'), ('Kais', 5, '05012'), ('Seggana', 5, '05013'), ('Ichmoul', 5, '05014'), ('Menaa', 5, '05015'), ('El Madher', 5, '05016'), ('Lazrou', 5, '05017'), ('Bouzina', 5, '05018'), ('Chemora', 5, '05019'), ('Oued El Ma', 5, '05020'), ('Talkhamt', 5, '05021'), ('Teniet El Abed', 5, '05022'), ('Ouyoun El Assafir', 5, '05023'), ('T''Kout', 5, '05024'), ('Ain Djasser', 5, '05025'), ('Ouled Aouf', 5, '05026'), ('Boumagueur', 5, '05027'), ('Bitam', 5, '05028'), ('Fesdis', 5, '05029'), ('Ain Touta', 5, '05030'), ('Ain Yagout', 5, '05031'), ('Hidoussa', 5, '05032'), ('Ouled Fadel', 5, '05033'), ('Ouled Si Slimane', 5, '05034'), ('Taxlent', 5, '05035'), ('Gosbat', 5, '05036'), ('Ouled Ammar', 5, '05037'), ('Boumia', 5, '05038'), ('Djerma', 5, '05039'), ('Guigba', 5, '05040'), ('Inoughissen', 5, '05041'), ('Maafa', 5, '05042'), ('Ouled Ameur', 5, '05043'), ('Ouled Maouhoub', 5, '05044'), ('Ouled Sidi Brahim', 5, '05045'), ('Tighanimine', 5, '05046'), ('Tilatou', 5, '05047'), ('Zanat El Beida', 5, '05048');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Béjaïa', 6, '06000'), ('Amizour', 6, '06001'), ('Aokas', 6, '06002'), ('Barbacha', 6, '06003'), ('Beni Djellil', 6, '06004'), ('Beni Ksila', 6, '06005'), ('Boudjellil', 6, '06006'), ('Bouhamza', 6, '06007'), ('Chemini', 6, '06008'), ('Darguina', 6, '06009'), ('El Kseur', 6, '06010'), ('Feraoun', 6, '06011'), ('Ighil Ali', 6, '06012'), ('Kendira', 6, '06013'), ('Seddouk', 6, '06014'), ('Sidi Aich', 6, '06015'), ('Souk El Tenine', 6, '06016'), ('Tazmalt', 6, '06017'), ('Tichy', 6, '06018'), ('Timezrit', 6, '06019'), ('Toudja', 6, '06020'), ('Adekar', 6, '06021'), ('Akbou', 6, '06022'), ('Akfadou', 6, '06023'), ('Amalou', 6, '06024'), ('Ait R''Zine', 6, '06025'), ('Ait Smail', 6, '06026'), ('Bougie', 6, '06027'), ('Draa El Kaid', 6, '06028'), ('Ifri', 6, '06029'), ('Ighram', 6, '06030'), ('Kherrata', 6, '06031'), ('M''Cisna', 6, '06032'), ('Melbou', 6, '06033'), ('Oued Ghir', 6, '06034'), ('Souk Oufella', 6, '06035'), ('Taourit Ighil', 6, '06036'), ('Taskriout', 6, '06037'), ('Tibane', 6, '06038'), ('Tifra', 6, '06039'), ('Tizi N''Berber', 6, '06040'), ('Tala Hamza', 6, '06041');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Biskra', 7, '07000'), ('Djemorah', 7, '07001'), ('El Outaya', 7, '07002'), ('Foughala', 7, '07003'), ('Branis', 7, '07004'), ('Chetma', 7, '07005'), ('El Kantara', 7, '07006'), ('Ain Naga', 7, '07007'), ('El Haouch', 7, '07008'), ('Ain Zaatout', 7, '07009'), ('El Mizaraa', 7, '07010'), ('Bouchagroun', 7, '07011'), ('M''Chouneche', 7, '07012'), ('Ouled Djellal', 7, '07013'), ('Ras El Miad', 7, '07014'), ('Sidi Khaled', 7, '07015'), ('Sidi Okba', 7, '07016'), ('Tolga', 7, '07017'), ('Zeribet El Oued', 7, '07018'), ('Lichana', 7, '07019'), ('Oumache', 7, '07020'), ('M''Lili', 7, '07021'), ('El Feidh', 7, '07022'), ('El Ghrous', 7, '07023'), ('Khenguet Sidi Nadji', 7, '07024');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Béchar', 8, '08000'), ('Erg Ferradj', 8, '08001'), ('Kenadsa', 8, '08002'), ('Meridja', 8, '08003'), ('Taghit', 8, '08004'), ('Beni Ounif', 8, '08005'), ('Mogheul', 8, '08006'), ('Abadla', 8, '08007'), ('Boukais', 8, '08008'), ('El Ouata', 8, '08009'), ('Kerkoub', 8, '08010'), ('Ouled Khoudir', 8, '08011'), ('Tabelbala', 8, '08012'), ('Tamtert', 8, '08013'), ('Beni Abbes', 8, '08014'), ('Timoudi', 8, '08015');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Blida', 9, '09000'), ('Bouarfa', 9, '09001'), ('Bouinan', 9, '09002'), ('Bougara', 9, '09003'), ('Boufarik', 9, '09004'), ('Chebli', 9, '09005'), ('Chiffa', 9, '09006'), ('Chrea', 9, '09007'), ('El Affroun', 9, '09008'), ('Guerrouaou', 9, '09009'), ('Hammam Melouane', 9, '09010'), ('Larbaa', 9, '09011'), ('Meftah', 9, '09012'), ('Mouzaia', 9, '09013'), ('Oued Alleug', 9, '09014'), ('Ouled Yaich', 9, '09015'), ('Souhane', 9, '09016'), ('Soumaa', 9, '09017'), ('Beni Tamou', 9, '09018'), ('Beni Mered', 9, '09019'), ('Beni Misra', 9, '09020'), ('Beni Sala', 9, '09021'), ('Birkhadem', 9, '09022'), ('Bouinan', 9, '09023'), ('Djebabra', 9, '09024'), ('Oued Djer', 9, '09025'), ('Ouled Slama', 9, '09026'), ('Tablat', 9, '09027');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Bouira', 10, '10000'), ('Ain Bessem', 10, '10001'), ('Ahl El Ksar', 10, '10002'), ('Ain El Hadjar', 10, '10003'), ('Ain Turk', 10, '10004'), ('Ait Laaziz', 10, '10005'), ('Ath Mansour', 10, '10006'), ('Bechloul', 10, '10007'), ('Bir Ghbalou', 10, '10008'), ('Bordj Okhriss', 10, '10009'), ('Bouderbala', 10, '10010'), ('Boukram', 10, '10011'), ('Chorfa', 10, '10012'), ('Dechmia', 10, '10013'), ('Dirrah', 10, '10014'), ('Djebahia', 10, '10015'), ('El Adjiba', 10, '10016'), ('El Asnam', 10, '10017'), ('El Hachimia', 10, '10018'), ('El Khabouzia', 10, '10019'), ('El Mokrani', 10, '10020'), ('Haizer', 10, '10021'), ('Hadjera Zerga', 10, '10022'), ('Kadiria', 10, '10023'), ('Lakhdaria', 10, '10024'), ('M''Chedallah', 10, '10025'), ('Maala', 10, '10026'), ('Maamora', 10, '10027'), ('Oued El Berdi', 10, '10028'), ('Ouled Rached', 10, '10029'), ('Raouraoua', 10, '10030'), ('Ridane', 10, '10031'), ('Saharidj', 10, '10032'), ('Souk El Khemis', 10, '10033'), ('Sour El Ghozlane', 10, '10034'), ('Taghzout', 10, '10035'), ('Taguedit', 10, '10036'), ('Zbarbar', 10, '10037');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Tamanrasset', 11, '11000'), ('Abalessa', 11, '11001'), ('In Ghar', 11, '11002'), ('In Guezzam', 11, '11003'), ('In Salah', 11, '11004'), ('Tazrouk', 11, '11005'), ('Tin Zaouatine', 11, '11006'), ('Idles', 11, '11007'), ('Tahifet', 11, '11008'), ('Ain Guezam', 11, '11009'), ('Ain Salah', 11, '11010');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Tébessa', 12, '12000'), ('Bir El Ater', 12, '12001'), ('Cheria', 12, '12002'), ('Stah Guentis', 12, '12003'), ('El Aouinet', 12, '12004'), ('El Kouif', 12, '12005'), ('El Ma Labiodh', 12, '12006'), ('El Meridj', 12, '12007'), ('El Ogla', 12, '12008'), ('El Ogla El Malha', 12, '12009'), ('Guorriguer', 12, '12010'), ('Hammamet', 12, '12011'), ('Morsott', 12, '12012'), ('Negrine', 12, '12013'), ('Ouenza', 12, '12014'), ('Oum Ali', 12, '12015'), ('Safsaf El Ouesra', 12, '12016'), ('Souk Ahras', 12, '12017'), ('Tlidjene', 12, '12018'), ('Ain Zerga', 12, '12019'), ('Bekkaria', 12, '12020'), ('Bir Dheheb', 12, '12021'), ('El Malabiodh', 12, '12022'), ('Ferkane', 12, '12023'), ('M''Daourouche', 12, '12024'), ('Oued El Kebir', 12, '12025'), ('Oum Laadham', 12, '12026'), ('Sidi Fredj', 12, '12027'), ('Tebessa', 12, '12028');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Tlemcen', 13, '13000'), ('Ain Fezza', 13, '13001'), ('Ain Ghoraba', 13, '13002'), ('Ain Kebira', 13, '13003'), ('Ain Nehala', 13, '13004'), ('Ain Tallout', 13, '13005'), ('Ain Youcef', 13, '13006'), ('Amieur', 13, '13007'), ('Azails', 13, '13008'), ('Bab El Assa', 13, '13009'), ('Beni Bahdel', 13, '13010'), ('Beni Boussaid', 13, '13011'), ('Beni Mester', 13, '13012'), ('Beni Ouarsous', 13, '13013'), ('Beni Snous', 13, '13014'), ('Bensekrane', 13, '13015'), ('Bouhlou', 13, '13016'), ('Chetouane', 13, '13017'), ('El Aricha', 13, '13018'), ('El Bouihi', 13, '13019'), ('El Fehoul', 13, '13020'), ('El Gor', 13, '13021'), ('Hennaya', 13, '13022'), ('Honaïne', 13, '13023'), ('Maghnia', 13, '13024'), ('Marsa Ben M''Hidi', 13, '13025'), ('Nedroma', 13, '13026'), ('Oued Chouly', 13, '13027'), ('Ouled Mimoun', 13, '13028'), ('Remchi', 13, '13029'), ('Sabra', 13, '13030'), ('Sebbaa Chioukh', 13, '13031'), ('Sebdou', 13, '13032'), ('Sidi Abdelli', 13, '13033'), ('Sidi Djillali', 13, '13034'), ('Sidi Medjahed', 13, '13035'), ('Souahlia', 13, '13036'), ('Souani', 13, '13037'), ('Terny', 13, '13038'), ('Zenata', 13, '13039');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Tiaret', 14, '14000'), ('Ain Bouchekif', 14, '14001'), ('Ain Deheb', 14, '14002'), ('Ain El Hadid', 14, '14003'), ('Ain Kermes', 14, '14004'), ('Ain Zarit', 14, '14005'), ('Bougara', 14, '14006'), ('Chehaima', 14, '14007'), ('Dahmouni', 14, '14008'), ('Djebilet Rosfa', 14, '14009'), ('Faidja', 14, '14010'), ('Frenda', 14, '14011'), ('Guertoufa', 14, '14012'), ('Hamadia', 14, '14013'), ('Ksar Chellala', 14, '14014'), ('Madna', 14, '14015'), ('Mahdia', 14, '14016'), ('Mechraa Safa', 14, '14017'), ('Medroussa', 14, '14018'), ('Meghila', 14, '14019'), ('Mellakou', 14, '14020'), ('Nadorah', 14, '14021'), ('Naima', 14, '14022'), ('Oued Lilli', 14, '14023'), ('Rahouia', 14, '14024'), ('Rechaiga', 14, '14025'), ('Sebaine', 14, '14026'), ('Sebt', 14, '14027'), ('Serghine', 14, '14028'), ('Si Abdelghani', 14, '14029'), ('Sidi Abderrahmane', 14, '14030'), ('Sidi Ali Mellal', 14, '14031'), ('Sidi Bakhti', 14, '14032'), ('Sidi Hosni', 14, '14033'), ('Sougueur', 14, '14034'), ('Tagdemt', 14, '14035'), ('Takhemaret', 14, '14036'), ('Tidda', 14, '14037'), ('Tousnina', 14, '14038'), ('Zmalet El Emir Abdelkader', 14, '14039');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Tizi Ouzou', 15, '15000'), ('Ain El Hammam', 15, '15001'), ('Ain Zaouia', 15, '15002'), ('Azazga', 15, '15003'), ('Azeffoun', 15, '15004'), ('Beni Douala', 15, '15005'), ('Beni Yenni', 15, '15006'), ('Boghni', 15, '15007'), ('Bounouh', 15, '15008'), ('Bouzeguene', 15, '15009'), ('Draa Ben Khedda', 15, '15010'), ('Draa El Mizan', 15, '15011'), ('Freha', 15, '15012'), ('Frikat', 15, '15013'), ('Iboudraren', 15, '15014'), ('Idjeur', 15, '15015'), ('Iferhounene', 15, '15016'), ('Ifigha', 15, '15017'), ('Iflissen', 15, '15018'), ('Illilten', 15, '15019'), ('Illoula Oumalou', 15, '15020'), ('Imsouhal', 15, '15021'), ('Irdjen', 15, '15022'), ('Larba Nath Irathen', 15, '15023'), ('Maatkas', 15, '15024'), ('Makouda', 15, '15025'), ('Mekla', 15, '15026'), ('Mizrana', 15, '15027'), ('Ouacif', 15, '15028'), ('Ouadhia', 15, '15029'), ('Ouaguenoun', 15, '15030'), ('Sidi Namane', 15, '15031'), ('Souk El Thenine', 15, '15032'), ('Tadmait', 15, '15033'), ('Tigzirt', 15, '15034'), ('Timizart', 15, '15035'), ('Tirmitine', 15, '15036'), ('Tizi Gheniff', 15, '15037'), ('Tizi N''Tleta', 15, '15038'), ('Tizi Rached', 15, '15039'), ('Yakouren', 15, '15040'), ('Yatafen', 15, '15041'), ('Zekri', 15, '15042');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Algiers', 16, '16000'), ('Ain Benian', 16, '16001'), ('Ain Taya', 16, '16002'), ('Bab Ezzouar', 16, '16003'), ('Baba Hassen', 16, '16004'), ('Bachdjerrah', 16, '16005'), ('Baraki', 16, '16006'), ('Ben Aknoun', 16, '16007'), ('Birkhadem', 16, '16008'), ('Bordj El Bahri', 16, '16009'), ('Bordj El Kiffan', 16, '16010'), ('Bourouba', 16, '16011'), ('Casbah', 16, '16012'), ('Cheraga', 16, '16013'), ('Dar El Beida', 16, '16014'), ('Dely Ibrahim', 16, '16015'), ('Djasr Kasentina', 16, '16016'), ('Douera', 16, '16017'), ('Draria', 16, '16018'), ('El Achour', 16, '16019'), ('El Biar', 16, '16020'), ('El Harrach', 16, '16021'), ('El Madania', 16, '16022'), ('El Magharia', 16, '16023'), ('El Marsa', 16, '16024'), ('El Mouradia', 16, '16025'), ('Hamma Annassers', 16, '16026'), ('Hammamet', 16, '16027'), ('Herraoua', 16, '16028'), ('Hussein Dey', 16, '16029'), ('Hydra', 16, '16030'), ('Kouba', 16, '16031'), ('Les Eucalyptus', 16, '16032'), ('Mahelma', 16, '16033'), ('Mohammadia', 16, '16034'), ('Oued Koriche', 16, '16035'), ('Oued Smar', 16, '16036'), ('Ouled Chebel', 16, '16037'), ('Ouled Fayet', 16, '16038'), ('Rais Hamidou', 16, '16039'), ('Reghaia', 16, '16040'), ('Rouiba', 16, '16041'), ('Sidi M''Hamed', 16, '16042'), ('Sidi Moussa', 16, '16043'), ('Souidania', 16, '16044'), ('Staoueli', 16, '16045'), ('Tessala El Merdja', 16, '16046'), ('Zeralda', 16, '16047');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Djelfa', 17, '17000'), ('Ain Chouhada', 17, '17001'), ('Ain El Ibel', 17, '17002'), ('Ain Feka', 17, '17003'), ('Ain Maabed', 17, '17004'), ('Ain Oussera', 17, '17005'), ('Amourah', 17, '17006'), ('Benhar', 17, '17007'), ('Birine', 17, '17008'), ('Bouira Lahdab', 17, '17009'), ('Charef', 17, '17010'), ('Dar Chioukh', 17, '17011'), ('Deldoul', 17, '17012'), ('Douis', 17, '17013'), ('El Guedid', 17, '17014'), ('El Idrissia', 17, '17015'), ('El Khemis', 17, '17016'), ('Faidh El Botma', 17, '17017'), ('Guernini', 17, '17018'), ('Had Sahary', 17, '17019'), ('Hassi Bahbah', 17, '17020'), ('Hassi El Euch', 17, '17021'), ('Hassi Fedoul', 17, '17022'), ('Messad', 17, '17023'), ('M''Liliha', 17, '17024'), ('Oum Laadham', 17, '17025'), ('Sed Rahal', 17, '17026'), ('Selmana', 17, '17027'), ('Sidi Baizid', 17, '17028'), ('Sidi Ladjel', 17, '17029'), ('Tadmit', 17, '17030'), ('Zaafrane', 17, '17031'), ('Zaccar', 17, '17032');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Jijel', 18, '18000'), ('Ain El Kebira', 18, '18001'), ('Ain Errich', 18, '18002'), ('Ain Kechra', 18, '18003'), ('Ain Sefra', 18, '18004'), ('Ain Zeroual', 18, '18005'), ('Bordj T''har', 18, '18006'), ('Boudria Beni Yadjis', 18, '18007'), ('Bouraoui Belhadef', 18, '18008'), ('Chekfa', 18, '18009'), ('Djemaa Beni Habibi', 18, '18010'), ('El Ancer', 18, '18011'), ('El Aouana', 18, '18012'), ('El Kennar Nouchfi', 18, '18013'), ('El Milia', 18, '18014'), ('Emir Abdelkader', 18, '18015'), ('Eraguene', 18, '18016'), ('Ghebala', 18, '18017'), ('Jijel', 18, '18018'), ('Kaous', 18, '18019'), ('Kemir', 18, '18020'), ('Oudjana', 18, '18021'), ('Ouled Rabah', 18, '18022'), ('Ouled Yahia Khadrouch', 18, '18023'), ('Selma Benziada', 18, '18024'), ('Settara', 18, '18025'), ('Sidi Abdelaziz', 18, '18026'), ('Sidi Maarouf', 18, '18027'), ('Taher', 18, '18028'), ('Texenna', 18, '18029'), ('Ziama Mansouriah', 18, '18030');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Sétif', 19, '19000'),('Ain Abessa', 19, '19001'),('Ain Arnat', 19, '19002'),('Ain Azel', 19, '19003'),('Ain El Kebira', 19, '19004'),('Ain Lahdjar', 19, '19005'),('Ain Legraj', 19, '19006'),('Ain Oulmene', 19, '19007'),('Ain Roua', 19, '19008'),('Ain Sebt', 19, '19009'),('Ain Taghrout', 19, '19010'),('Amoucha', 19, '19011'),('Babor', 19, '19012'),('Bazer Sakhra', 19, '19013'),('Beidha Bordj', 19, '19014'),('Belaa', 19, '19015'),('Beni Aziz', 19, '19016'),('Beni Chebana', 19, '19017'),('Beni Fouda', 19, '19018'),('Beni Hocine', 19, '19019'),('Beni Ourtilane', 19, '19020'),('Bir El Arch', 19, '19021'),('Bir Haddada', 19, '19022'),('Bouandas', 19, '19023'),('Bougaa', 19, '19024'),('Bousselam', 19, '19025'),('Boutaleb', 19, '19026'),('Dehamcha', 19, '19027'),('Djemila', 19, '19028'),('Draa Kebila', 19, '19029'),('El Eulma', 19, '19030'),('El Ouricia', 19, '19031'),('Guellal', 19, '19032'),('Guelta Zerka', 19, '19033'),('Hamma', 19, '19034'),('Hammam Guergour', 19, '19035'),('Harbil', 19, '19036'),('Ksar El Abtal', 19, '19037'),('Maaouia', 19, '19038'),('Maoklane', 19, '19039'),('Mezloug', 19, '19040'),('Oued El Barad', 19, '19041'),('Ouled Addouane', 19, '19042'),('Ouled Sabor', 19, '19043'),('Ouled Si Ahmed', 19, '19044'),('Ouled Tebben', 19, '19045'),('Rasfa', 19, '19046'),('Salah Bey', 19, '19047'),('Serdj El Ghoul', 19, '19048'),('Tachouda', 19, '19049'),('Talaifacene', 19, '19050'),('Taya', 19, '19051'),('Tella', 19, '19052'),('Tizi N''Bechar', 19, '19053');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Saïda', 20, '20000'), ('Ain El Hadjar', 20, '20001'), ('Ain Soltane', 20, '20002'), ('Doui Thabet', 20, '20003'), ('El Hassasna', 20, '20004'), ('Hounet', 20, '20005'), ('Maamora', 20, '20006'), ('Ouled Brahim', 20, '20007'), ('Ouled Khaled', 20, '20008'), ('Sidi Ahmed', 20, '20009'), ('Sidi Amar', 20, '20010'), ('Sidi Boubekeur', 20, '20011'), ('Tircine', 20, '20012'), ('Youb', 20, '20013');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Skikda', 21, '21000'), ('Ain Bouziane', 21, '21001'), ('Ain Charchar', 21, '21002'), ('Ain Kechra', 21, '21003'), ('Ain Zouit', 21, '21004'), ('Azzaba', 21, '21005'), ('Bekkouche Lakhdar', 21, '21006'), ('Ben Azzouz', 21, '21007'), ('Beni Bechir', 21, '21008'), ('Beni Oulbane', 21, '21009'), ('Beni Zid', 21, '21010'), ('Bin El Ouiden', 21, '21011'), ('Bouchtata', 21, '21012'), ('Cheraia', 21, '21013'), ('Collo', 21, '21014'), ('Djendel Saadi Mohamed', 21, '21015'), ('El Ghedir', 21, '21016'), ('El Hadaiek', 21, '21017'), ('El Marsa', 21, '21018'), ('Emdjez Edchich', 21, '21019'), ('Essebt', 21, '21020'), ('Filfila', 21, '21021'), ('Hamadi Krouma', 21, '21022'), ('Kanoua', 21, '21023'), ('Kerkera', 21, '21024'), ('Kheneg Mayoum', 21, '21025'), ('Oued Zehour', 21, '21026'), ('Ouldja Boulballout', 21, '21027'), ('Ouled Attia', 21, '21028'), ('Ouled Hbaba', 21, '21029'), ('Oum Toub', 21, '21030'), ('Ramdane Djamel', 21, '21031'), ('Salah Bouchaour', 21, '21032'), ('Sidi Mezghiche', 21, '21033'), ('Tamalous', 21, '21034'), ('Zerdazas', 21, '21035'), ('Zitouna', 21, '21036');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Sidi Bel Abbès', 22, '22000'), ('Ain Adden', 22, '22001'), ('Ain El Berd', 22, '22002'), ('Ain Kada', 22, '22003'), ('Ain Thrid', 22, '22004'), ('Ain Tindamine', 22, '22005'), ('Amarnas', 22, '22006'), ('Badredine El Mokrani', 22, '22007'), ('Benachiba Chelia', 22, '22008'), ('Bir El Hammam', 22, '22009'), ('Boudjebaa El Bordj', 22, '22010'), ('Boukhanafis', 22, '22011'), ('Chetouane Belaila', 22, '22012'), ('Dhaya', 22, '22013'), ('El Hacaiba', 22, '22014'), ('Hassi Dahou', 22, '22015'), ('Hassi Zehana', 22, '22016'), ('Lamtar', 22, '22017'), ('M''Cid', 22, '22018'), ('Makedra', 22, '22019'), ('Marhoum', 22, '22020'), ('Merine', 22, '22021'), ('Mezaourou', 22, '22022'), ('Mostefa Ben Brahim', 22, '22023'), ('Moulay Slissen', 22, '22024'), ('Oued Sebaa', 22, '22025'), ('Oued Sefioun', 22, '22026'), ('Oued Taourira', 22, '22027'), ('Ras El Ma', 22, '22028'), ('Redjem Demouche', 22, '22029'), ('Sehala Thaoura', 22, '22030'), ('Sfisef', 22, '22031'), ('Sidi Ali Benyoub', 22, '22032'), ('Sidi Ali Boussidi', 22, '22033'), ('Sidi Brahim', 22, '22034'), ('Sidi Chaib', 22, '22035'), ('Sidi Dahou Debdou', 22, '22036'), ('Sidi Hamadouche', 22, '22037'), ('Sidi Khaled', 22, '22038'), ('Sidi Lahcene', 22, '22039'), ('Sidi Yacoub', 22, '22040'), ('Tabia', 22, '22041'), ('Tafissour', 22, '22042'), ('Taoudmout', 22, '22043'), ('Teghalimet', 22, '22044'), ('Tenira', 22, '22045'), ('Tessala', 22, '22046'), ('Tilmouni', 22, '22047'), ('Zerouala', 22, '22048');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Annaba', 23, '23000'), ('Ain Berda', 23, '23001'), ('Ain El Assel', 23, '23002'), ('Ain Kerma', 23, '23003'), ('Annaba', 23, '23004'), ('Berrahal', 23, '23005'), ('Chetaibi', 23, '23006'), ('Cheurfa', 23, '23007'), ('El Bouni', 23, '23008'), ('El Hadjar', 23, '23009'), ('Eulma', 23, '23010'), ('Oued El Aneb', 23, '23011'), ('Seraidi', 23, '23012'), ('Sidi Amar', 23, '23013'), ('Treat', 23, '23014');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Guelma', 24, '24000'), ('Ain Ben Beida', 24, '24001'), ('Ain Hessania', 24, '24002'), ('Ain Larbi', 24, '24003'), ('Ain Makhlouf', 24, '24004'), ('Ain Reggada', 24, '24005'), ('Ain Sandel', 24, '24006'), ('Belkheir', 24, '24007'), ('Ben Djarah', 24, '24008'), ('Beni Mezline', 24, '24009'), ('Bordj Sabat', 24, '24010'), ('Bou Hachana', 24, '24011'), ('Bou Hamdane', 24, '24012'), ('Bouati Mahmoud', 24, '24013'), ('Bouchegouf', 24, '24014'), ('Boumahra Ahmed', 24, '24015'), ('Dahouara', 24, '24016'), ('Djeballah Khemissi', 24, '24017'), ('El Fedjoudj', 24, '24018'), ('Guellat Bou Dbaa', 24, '24019'), ('Hammam Debagh', 24, '24020'), ('Hammam Maskhoutine', 24, '24021'), ('Hammam N''Bails', 24, '24022'), ('Heliopolis', 24, '24023'), ('Khezarra', 24, '24024'), ('Medjez Amar', 24, '24025'), ('Medjez Sfa', 24, '24026'), ('Nechmaya', 24, '24027'), ('Oued Cheham', 24, '24028'), ('Oued Fragha', 24, '24029'), ('Oued Zenati', 24, '24030'), ('Ras El Agba', 24, '24031'), ('Roknia', 24, '24032'), ('Sellaoua Announa', 24, '24033'), ('Tamlouka', 24, '24034');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Constantine', 25, '25000'), ('Ain Abid', 25, '25001'), ('Ain Smara', 25, '25002'), ('Ben Badis', 25, '25003'), ('Didouche Mourad', 25, '25004'), ('El Khroub', 25, '25005'), ('Hamma Bouziane', 25, '25006'), ('Ibn Ziad', 25, '25007'), ('Zighoud Youcef', 25, '25008'), ('Ouled Rahmoune', 25, '25009'), ('Ain Kerma', 25, '25010'), ('Ain Netta', 25, '25011'), ('Ain Sghir', 25, '25012'), ('Bellevue', 25, '25013'), ('Boumerdes', 25, '25014'), ('Chelghoum Laid', 25, '25015'), ('Draa Ben Khedda', 25, '25016'), ('El Haria', 25, '25017'), ('El Meridj', 25, '25018'), ('Emir Abdelkader', 25, '25019'), ('Ibn Ziad', 25, '25020'), ('Meskiana', 25, '25021'), ('Oued Athmania', 25, '25022'), ('Ouled Chebel', 25, '25023'), ('Ouled Djellal', 25, '25024'), ('Oum El Bouaghi', 25, '25025'), ('Ras El Oued', 25, '25026'), ('Sigus', 25, '25027'), ('Tassala', 25, '25028'), ('Tebessa', 25, '25029'), ('Telerghma', 25, '25030'), ('Tiddis', 25, '25031'), ('Zighoud Youcef', 25, '25032');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Médéa', 26, '26000'), ('Ain Boucif', 26, '26001'), ('Ain Ouksir', 26, '26002'), ('Aissaouia', 26, '26003'), ('Aziz', 26, '26004'), ('Baata', 26, '26005'), ('Benchicao', 26, '26006'), ('Beni Slimane', 26, '26007'), ('Berrouaghia', 26, '26008'), ('Bir Ben Laabed', 26, '26009'), ('Boghar', 26, '26010'), ('Bouaiche', 26, '26011'), ('Bouaichoune', 26, '26012'), ('Bouchrahil', 26, '26013'), ('Boughezoul', 26, '26014'), ('Bouskene', 26, '26015'), ('Chahbounia', 26, '26016'), ('Chellalat El Adhaoura', 26, '26017'), ('Cheniguel', 26, '26018'), ('Derrag', 26, '26019'), ('Djouab', 26, '26020'), ('Draa Essamar', 26, '26021'), ('El Azizia', 26, '26022'), ('El Omaria', 26, '26023'), ('El Guelbelkebir', 26, '26024'), ('Hannacha', 26, '26025'), ('Kef Lakhdar', 26, '26026'), ('Khams Djouamaa', 26, '26027'), ('Ksar Boukhari', 26, '26028'), ('Meghraoua', 26, '26029'), ('Meftaha', 26, '26030'), ('Mihoub', 26, '26031'), ('Ouamri', 26, '26032'), ('Oued Harbil', 26, '26033'), ('Ouled Antar', 26, '26034'), ('Ouled Bouachra', 26, '26035'), ('Ouled Brahim', 26, '26036'), ('Ouled Deide', 26, '26037'), ('Ouled Hellal', 26, '26038'), ('Ouled Maaref', 26, '26039'), ('Oum El Djalil', 26, '26040'), ('Rebaia', 26, '26041'), ('Saneg', 26, '26042'), ('Sedraia', 26, '26043'), ('Seghouane', 26, '26044'), ('Si Mahdjoub', 26, '26045'), ('Sidi Damed', 26, '26046'), ('Sidi Errabia', 26, '26047'), ('Sidi Naamane', 26, '26048'), ('Sidi Zahar', 26, '26049'), ('Sidi Ziane', 26, '26050'), ('Souagui', 26, '26051'), ('Tablat', 26, '26052'), ('Tafraout', 26, '26053'), ('Tamesguida', 26, '26054'), ('Tizi Mahdi', 26, '26055'), ('Zoubiria', 26, '26056');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Mostaganem', 27, '27000'), ('Ain Boudinar', 27, '27001'), ('Ain Nouissy', 27, '27002'), ('Ain Sidi Cherif', 27, '27003'), ('Ain Tadles', 27, '27004'), ('Benabdelmalek Ramdane', 27, '27005'), ('Bouguirat', 27, '27006'), ('El Hassaine', 27, '27007'), ('Fornaka', 27, '27008'), ('Hadjadj', 27, '27009'), ('Hassi Mameche', 27, '27010'), ('Kheir Eddine', 27, '27011'), ('Mansourah', 27, '27012'), ('Mesra', 27, '27013'), ('Mazagran', 27, '27014'), ('Nekmaria', 27, '27015'), ('Oued El Kheir', 27, '27016'), ('Ouled Boughalem', 27, '27017'), ('Ouled Maallah', 27, '27018'), ('Safsaf', 27, '27019'), ('Sayada', 27, '27020'), ('Sidi Ali', 27, '27021'), ('Sidi Belattar', 27, '27022'), ('Sidi Lakhdar', 27, '27023'), ('Sidi Mohamed', 27, '27024'), ('Souaflia', 27, '27025'), ('Sour', 27, '27026'), ('Stidia', 27, '27027'), ('Tazgait', 27, '27028'), ('Touahria', 27, '27029'), ('Abdelmalek Ramdane', 27, '27030');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('MSila', 28, '28000'), ('Ain El Hadjel', 28, '28001'), ('Ain El Melh', 28, '28002'), ('Ain Fares', 28, '28003'), ('Ain Khadra', 28, '28004'), ('Ain Rich', 28, '28005'), ('Ain Timguenai', 28, '28006'), ('Belaiba', 28, '28007'), ('Ben Srour', 28, '28008'), ('Beni Ilmane', 28, '28009'), ('Benzouh', 28, '28010'), ('Berhoum', 28, '28011'), ('Bir Foda', 28, '28012'), ('Bou Saada', 28, '28013'), ('Bouti Sayah', 28, '28014'), ('Chellal', 28, '28015'), ('Dehahna', 28, '28016'), ('Djebel Messaad', 28, '28017'), ('El Hamel', 28, '28018'), ('El Houamed', 28, '28019'), ('Hammam Dhalaa', 28, '28020'), ('Khettouti Sed El Djir', 28, '28021'), ('Khoubana', 28, '28022'), ('Maadid', 28, '28023'), ('Maarif', 28, '28024'), ('Magra', 28, '28025'), ('Medjedel', 28, '28026'), ('MSila', 28, '28027'), ('M''Tarfa', 28, '28028'), ('Ouanougha', 28, '28029'), ('Ouled Addi Guebala', 28, '28030'), ('Ouled Atia', 28, '28031'), ('Ouled Derradj', 28, '28032'), ('Ouled Madhi', 28, '28033'), ('Ouled Mansour', 28, '28034'), ('Ouled Sidi Brahim', 28, '28035'), ('Ouled Slimane', 28, '28036'), ('Oultene', 28, '28037'), ('Sidi Aissa', 28, '28038'), ('Sidi Ameur', 28, '28039'), ('Sidi Hadjeres', 28, '28040'), ('Sidi M''Hamed', 28, '28041'), ('Slim', 28, '28042'), ('Souamaa', 28, '28043'), ('Tamsa', 28, '28044'), ('Tarmount', 28, '28045'), ('Zarzour', 28, '28046');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Mascara', 29, '29000'), ('Ain Fares', 29, '29001'), ('Ain Fekan', 29, '29002'), ('Ain Ferah', 29, '29003'), ('Ain Fras', 29, '29004'), ('Alaimia', 29, '29005'), ('Aouf', 29, '29006'), ('Beniane', 29, '29007'), ('Bou Hanifia', 29, '29008'), ('Bou Henni', 29, '29009'), ('Chorfa', 29, '29010'), ('El Bordj', 29, '29011'), ('El Gaada', 29, '29012'), ('El Ghomri', 29, '29013'), ('El Guettana', 29, '29014'), ('El Keurt', 29, '29015'), ('El Menaouer', 29, '29016'), ('Ferraguig', 29, '29017'), ('Froha', 29, '29018'), ('Gharrous', 29, '29019'), ('Guerdjoum', 29, '29020'), ('Hachem', 29, '29021'), ('Hacine', 29, '29022'), ('Khalouia', 29, '29023'), ('Makdha', 29, '29024'), ('Maoussa', 29, '29025'), ('Mascara', 29, '29026'), ('Matemore', 29, '29027'), ('Mocta Douz', 29, '29028'), ('Nesmoth', 29, '29029'), ('Oggaz', 29, '29030'), ('Oued El Abtal', 29, '29031'), ('Oued Taria', 29, '29032'), ('Ras Ain Amirouche', 29, '29033'), ('Sedjerara', 29, '29034'), ('Sehailia', 29, '29035'), ('Sidi Abdeldjebar', 29, '29036'), ('Sidi Abdelmoumen', 29, '29037'), ('Sidi Boussaid', 29, '29038'), ('Sidi Kada', 29, '29039'), ('Sig', 29, '29040'), ('Tighennif', 29, '29041'), ('Tizi', 29, '29042'), ('Zahana', 29, '29043'), ('Zelameta', 29, '29044');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Ouargla', 30, '30000'), ('Ain Beida', 30, '30001'), ('Benaceur', 30, '30002'), ('El Allia', 30, '30003'), ('El Borma', 30, '30004'), ('El Hadjira', 30, '30005'), ('El Khoub', 30, '30006'), ('Hassi Ben Abdellah', 30, '30007'), ('Hassi Messaoud', 30, '30008'), ('Megarine', 30, '30009'), ('N''Goussa', 30, '30010'), ('Ouargla', 30, '30011'), ('Rouissat', 30, '30012'), ('Sidi Khouiled', 30, '30013'), ('Sidi Slimane', 30, '30014'), ('Taibet', 30, '30015'), ('Tebesbest', 30, '30016'), ('Touggourt', 30, '30017'), ('Zaouia El Abidia', 30, '30018');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Oran', 31, '31000'), ('Ain El Turk', 31, '31001'), ('Arzew', 31, '31002'), ('Ben Freha', 31, '31003'), ('Bethioua', 31, '31004'), ('Bir El Djir', 31, '31005'), ('Boufatis', 31, '31006'), ('Bousfer', 31, '31007'), ('Boutlelis', 31, '31008'), ('El Ancor', 31, '31009'), ('El Braya', 31, '31010'), ('El Karma', 31, '31011'), ('El Kemri', 31, '31012'), ('Es Senia', 31, '31013'), ('Gdyel', 31, '31014'), ('Hassi Bounif', 31, '31015'), ('Hassi Ben Okba', 31, '31016'), ('Hassi Mefsoukh', 31, '31017'), ('Mers El Kebir', 31, '31018'), ('Misserghin', 31, '31019'), ('Oran', 31, '31020'), ('Oued Tlelat', 31, '31021'), ('Sidi Benyebka', 31, '31022'), ('Sidi Chami', 31, '31023'), ('Tafraoui', 31, '31024');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('El Bayadh', 32, '32000'), ('Arbaouat', 32, '32001'), ('Boualem', 32, '32002'), ('Bougtoub', 32, '32003'), ('Boussemghoun', 32, '32004'), ('Brezina', 32, '32005'), ('Chellala', 32, '32006'), ('Cheguig', 32, '32007'), ('El Abiodh Sidi Cheikh', 32, '32008'), ('El Bnoud', 32, '32009'), ('El Kheiter', 32, '32010'), ('El Mehara', 32, '32011'), ('Ghassoul', 32, '32012'), ('Kef El Ahmar', 32, '32013'), ('Rogassa', 32, '32014'), ('Sidi Ameur', 32, '32015'), ('Sidi Slimane', 32, '32016'), ('Sidi Tifour', 32, '32017'), ('Stitten', 32, '32018'), ('Tousmouline', 32, '32019'), ('El Bayadh', 32, '32020');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Illizi', 33, '33000'), ('Bordj Omar Driss', 33, '33001'), ('Debdeb', 33, '33002'), ('In Amenas', 33, '33003'), ('Illizi', 33, '33004');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Bordj Bou Arréridj', 34, '34000'), ('Ain Taghrout', 34, '34001'), ('Ain Tesra', 34, '34002'), ('Belimour', 34, '34003'), ('Ben Daoud', 34, '34004'), ('Bir Kasdali', 34, '34005'), ('Bordj Bou Arreridj', 34, '34006'), ('Bordj Ghdir', 34, '34007'), ('Bordj Zemoura', 34, '34008'), ('Colla', 34, '34009'), ('Djaafra', 34, '34010'), ('El Ach', 34, '34011'), ('El Achir', 34, '34012'), ('El Anseur', 34, '34013'), ('El Hamadia', 34, '34014'), ('El Main', 34, '34015'), ('El M''Hir', 34, '34016'), ('Ghailasa', 34, '34017'), ('Haraza', 34, '34018'), ('Hasnaoua', 34, '34019'), ('Khelil', 34, '34020'), ('Ksour', 34, '34021'), ('Mansoura', 34, '34022'), ('Medjana', 34, '34023'), ('Ouled Brahem', 34, '34024'), ('Ouled Dahmane', 34, '34025'), ('Ouled Sidi Brahim', 34, '34026'), ('Rabta', 34, '34027'), ('Ras El Oued', 34, '34028'), ('Sidi Embarek', 34, '34029'), ('Tafreg', 34, '34030'), ('Taglait', 34, '34031'), ('Teniet En Nasr', 34, '34032'), ('Tixter', 34, '34033');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Boumerdès', 35, '35000'), ('Afir', 35, '35001'), ('Ammal', 35, '35002'), ('Baghlia', 35, '35003'), ('Ben Choud', 35, '35004'), ('Beni Amrane', 35, '35005'), ('Bordj Menaiel', 35, '35006'), ('Boudouaou', 35, '35007'), ('Boudouaou El Bahri', 35, '35008'), ('Boumerdes', 35, '35009'), ('Bouzegza Keddara', 35, '35010'), ('Chabet El Ameur', 35, '35011'), ('Corso', 35, '35012'), ('Dellys', 35, '35013'), ('Djinet', 35, '35014'), ('El Kharrouba', 35, '35015'), ('Hammedi', 35, '35016'), ('Isser', 35, '35017'), ('Khemis El Khechna', 35, '35018'), ('Larbatache', 35, '35019'), ('Legata', 35, '35020'), ('Naciria', 35, '35021'), ('Ouled Aissa', 35, '35022'), ('Ouled Hedadj', 35, '35023'), ('Ouled Moussa', 35, '35024'), ('Si Mustapha', 35, '35025'), ('Sidi Daoud', 35, '35026'), ('Souk El Had', 35, '35027'), ('Taourga', 35, '35028'), ('Thenia', 35, '35029'), ('Tidjelabine', 35, '35030'), ('Timezrit', 35, '35031'), ('Zemmouri', 35, '35032');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('El Tarf', 36, '36000'), ('Ain El Assel', 36, '36001'), ('Ain Kerma', 36, '36002'), ('Asfour', 36, '36003'), ('Ben M''Hidi', 36, '36004'), ('Berrihane', 36, '36005'), ('Besbes', 36, '36006'), ('Bouhadjar', 36, '36007'), ('Bouteldja', 36, '36008'), ('Chebaita Mokhtar', 36, '36009'), ('Chefia', 36, '36010'), ('Chihani', 36, '36011'), ('Dréan', 36, '36012'), ('Echatt', 36, '36013'), ('El Aioun', 36, '36014'), ('El Kala', 36, '36015'), ('El Tarf', 36, '36016'), ('Hammam Beni Salah', 36, '36017'), ('Lac Des Oiseaux', 36, '36018'), ('Oued Zitoun', 36, '36019'), ('Raml Souk', 36, '36020'), ('Souarekh', 36, '36021'), ('Zerizer', 36, '36022'), ('Zitouna', 36, '36023');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Tindouf', 37, '37000'), ('Oum El Assel', 37, '37001');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Tissemsilt', 38, '38000'), ('Ammari', 38, '38001'), ('Bordj Bou Naama', 38, '38002'), ('Bordj Emir Abdelkader', 38, '38003'), ('Boucaid', 38, '38004'), ('Khemisti', 38, '38005'), ('Lardjem', 38, '38006'), ('Lazharia', 38, '38007'), ('Maacem', 38, '38008'), ('Melaab', 38, '38009'), ('Ouled Bessem', 38, '38010'), ('Sidi Abed', 38, '38011'), ('Sidi Boutouchent', 38, '38012'), ('Sidi Lantri', 38, '38013'), ('Sidi Slimane', 38, '38014'), ('Tamalaht', 38, '38015'), ('Theniet El Had', 38, '38016'), ('Tissemsilt', 38, '38017'), ('Youssoufia', 38, '38018');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('El Oued', 39, '39000'), ('Bayadha', 39, '39001'), ('Debila', 39, '39002'), ('Djamaa', 39, '39003'), ('Douar El Ma', 39, '39004'), ('El M''Ghair', 39, '39005'), ('El Oued', 39, '39006'), ('Guemar', 39, '39007'), ('Hassi Khalifa', 39, '39008'), ('Kouinine', 39, '39009'), ('Magrane', 39, '39010'), ('Mih Ouensa', 39, '39011'), ('M''Rara', 39, '39012'), ('Nakhla', 39, '39013'), ('Oued El Alenda', 39, '39014'), ('Oum Touyour', 39, '39015'), ('Ourmes', 39, '39016'), ('Reguiba', 39, '39017'), ('Robbah', 39, '39018'), ('Sidi Amrane', 39, '39019'), ('Sidi Aoun', 39, '39020'), ('Sidi Khellil', 39, '39021'), ('Still', 39, '39022'), ('Taghzout', 39, '39023'), ('Taleb Larbi', 39, '39024'), ('Tendla', 39, '39025'), ('Trifaoui', 39, '39026');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Khenchela', 40, '40000'), ('Ain Touila', 40, '40001'), ('Babar', 40, '40002'), ('Baghai', 40, '40003'), ('Bouhmama', 40, '40004'), ('Chelia', 40, '40005'), ('Chechar', 40, '40006'), ('Djellal', 40, '40007'), ('El Hamma', 40, '40008'), ('El Mahmal', 40, '40009'), ('Ensigha', 40, '40010'), ('Fais', 40, '40011'), ('Kaïs', 40, '40012'), ('Kais', 40, '40013'), ('Khenchela', 40, '40014'), ('Khirane', 40, '40015'), ('M''Sara', 40, '40016'), ('M''Toussa', 40, '40017'), ('Ouled Rechache', 40, '40018'), ('Remila', 40, '40019'), ('Tamza', 40, '40020'), ('Taouzianat', 40, '40021'), ('Yabous', 40, '40022');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Souk Ahras', 41, '41000'), ('Ain Zana', 41, '41001'), ('Bir Bouhouche', 41, '41002'), ('Drea', 41, '41003'), ('Haddada', 41, '41004'), ('Hanencha', 41, '41005'), ('Khedara', 41, '41006'), ('Khemissa', 41, '41007'), ('M''Daourouche', 41, '41008'), ('Mechroha', 41, '41009'), ('Merahna', 41, '41010'), ('Ouled Driss', 41, '41011'), ('Ouled Moumen', 41, '41012'), ('Oum El Adhaim', 41, '41013'), ('Ragouba', 41, '41014'), ('Safel El Ouiden', 41, '41015'), ('Sedrata', 41, '41016'), ('Sidi Fredj', 41, '41017'), ('Taoura', 41, '41018'), ('Terraguelt', 41, '41019'), ('Tiffech', 41, '41020'), ('Zaarouria', 41, '41021'), ('Zouabi', 41, '41022');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Tipaza', 42, '42000'), ('Ahmer El Ain', 42, '42001'), ('Ain Tagourait', 42, '42002'), ('Attatba', 42, '42003'), ('Beni Milleuk', 42, '42004'), ('Bou Ismaïl', 42, '42005'), ('Bouharoun', 42, '42006'), ('Bourkika', 42, '42007'), ('Chaiba', 42, '42008'), ('Cherchell', 42, '42009'), ('Damous', 42, '42010'), ('Douaouda', 42, '42011'), ('Fouka', 42, '42012'), ('Gouraya', 42, '42013'), ('Hadjout', 42, '42014'), ('Khemisti', 42, '42015'), ('Kolea', 42, '42016'), ('Larhat', 42, '42017'), ('Menaceur', 42, '42018'), ('Messelmoun', 42, '42019'), ('Nador', 42, '42020'), ('Sidi Amar', 42, '42021'), ('Sidi Ghiles', 42, '42022'), ('Sidi Rached', 42, '42023'), ('Sidi Semiane', 42, '42024'), ('Tipaza', 42, '42025');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Mila', 43, '43000'), ('Ahmed Rachedi', 43, '43001'), ('Ain Beida Harriche', 43, '43002'), ('Ain Mellouk', 43, '43003'), ('Ain Tine', 43, '43004'), ('Amira Arras', 43, '43005'), ('Benyahia Abderrahmane', 43, '43006'), ('Bouhatem', 43, '43007'), ('Chigara', 43, '43008'), ('Chelghoum Laid', 43, '43009'), ('Derradji Bousselah', 43, '43010'), ('El Mechira', 43, '43011'), ('Elayadi Barbes', 43, '43012'), ('Ferdjioua', 43, '43013'), ('Grarem Gouga', 43, '43014'), ('Hamala', 43, '43015'), ('Mila', 43, '43016'), ('Minar Zarza', 43, '43017'), ('Oued Athmenia', 43, '43018'), ('Oued Endja', 43, '43019'), ('Oued Seguen', 43, '43020'), ('Ouled Khalouf', 43, '43021'), ('Rouached', 43, '43022'), ('Sidi Khelifa', 43, '43023'), ('Sidi Merouane', 43, '43024'), ('Tadjenanet', 43, '43025'), ('Tassadane Haddada', 43, '43026'), ('Teleghma', 43, '43027'), ('Terrai Bainen', 43, '43028'), ('Tessala Lamatai', 43, '43029'), ('Tiberguent', 43, '43030'), ('Yahia Beni Guecha', 43, '43031'), ('Zeghaia', 43, '43032');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Aïn Defla', 44, '44000'), ('Ain Benian', 44, '44001'), ('Ain Bouyahia', 44, '44002'), ('Ain Defla', 44, '44003'), ('Ain Lechiakh', 44, '44004'), ('Ain Soltane', 44, '44005'), ('Ain Torki', 44, '44006'), ('Arib', 44, '44007'), ('Bathia', 44, '44008'), ('Belaas', 44, '44009'), ('Ben Allal', 44, '44010'), ('Bir Ouled Khelifa', 44, '44011'), ('Bordj Emir Khaled', 44, '44012'), ('Boumedfaa', 44, '44013'), ('Bourached', 44, '44014'), ('Djelida', 44, '44015'), ('Djemaa Ouled Cheikh', 44, '44016'), ('El Abadia', 44, '44017'), ('El Amra', 44, '44018'), ('El Attaf', 44, '44019'), ('El Hassania', 44, '44020'), ('El Maine', 44, '44021'), ('Hammam Righa', 44, '44022'), ('Hoceinia', 44, '44023'), ('Khemis Miliana', 44, '44024'), ('Mekhatria', 44, '44025'), ('Miliana', 44, '44026'), ('Oued Chorfa', 44, '44027'), ('Oued Djemaa', 44, '44028'), ('Rouina', 44, '44029'), ('Sidi Lakhdar', 44, '44030'), ('Tacheta Zougagha', 44, '44031'), ('Tarik Ibn Ziad', 44, '44032'), ('Tiberkanine', 44, '44033'), ('Zeddine', 44, '44034');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Naâma', 45, '45000'), ('Ain Ben Khelil', 45, '45001'), ('Ain Safra', 45, '45002'), ('Assela', 45, '45003'), ('Djeniane Bourzeg', 45, '45004'), ('El Biod', 45, '45005'), ('Kasdir', 45, '45006'), ('Makman Ben Amer', 45, '45007'), ('Mecheria', 45, '45008'), ('Moghrar', 45, '45009'), ('Naama', 45, '45010'), ('Sfissifa', 45, '45011'), ('Tiout', 45, '45012');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Aïn Témouchent', 46, '46000'), ('Ain El Arbaa', 46, '46001'), ('Ain Kihal', 46, '46002'), ('Ain Témouchent', 46, '46003'), ('Ain Tolba', 46, '46004'), ('Aoubellil', 46, '46005'), ('Beni Saf', 46, '46006'), ('Bou Zedjar', 46, '46007'), ('Chaabet El Leham', 46, '46008'), ('Chentouf', 46, '46009'), ('El Amria', 46, '46010'), ('El Emir Abdelkader', 46, '46011'), ('El Malah', 46, '46012'), ('El Messaid', 46, '46013'), ('Hammam Bou Hadjar', 46, '46014'), ('Hassasna', 46, '46015'), ('Hassi El Ghella', 46, '46016'), ('Oued Berkeche', 46, '46017'), ('Oued Sabah', 46, '46018'), ('Ouled Boudjemaa', 46, '46019'), ('Ouled Kihal', 46, '46020'), ('Oulhaca El Gheraba', 46, '46021'), ('Sidi Ben Adda', 46, '46022'), ('Sidi Boumediene', 46, '46023'), ('Sidi Ouriache', 46, '46024'), ('Sidi Safi', 46, '46025'), ('Tamzoura', 46, '46026'), ('Terga', 46, '46027');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Ghardaïa', 47, '47000'), ('Berriane', 47, '47001'), ('Bounoura', 47, '47002'), ('Dhayet Bendhahoua', 47, '47003'), ('El Atteuf', 47, '47004'), ('El Guerrara', 47, '47005'), ('Mansoura', 47, '47006'), ('Metlili', 47, '47007'), ('Sebseb', 47, '47008'), ('Zelfana', 47, '47009');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Relizane', 48, '48000'), ('Ain Rahma', 48, '48001'), ('Ain Tarek', 48, '48002'), ('Ammi Moussa', 48, '48003'), ('Belassel Bouzegza', 48, '48004'), ('Bendaoud', 48, '48005'), ('Beni Dergoun', 48, '48006'), ('Beni Zentis', 48, '48007'), ('Dar Ben Abdellah', 48, '48008'), ('Djidiouia', 48, '48009'), ('El Guettar', 48, '48010'), ('El Hamri', 48, '48011'), ('El Hassi', 48, '48012'), ('El Matmar', 48, '48013'), ('El Ouldja', 48, '48014'), ('Had Echkalla', 48, '48015'), ('Hamri', 48, '48016'), ('Kalaa', 48, '48017'), ('Lahlef', 48, '48018'), ('Mazouna', 48, '48019'), ('Mediouna', 48, '48020'), ('Mendes', 48, '48021'), ('Merrah', 48, '48022'), ('M''Cid', 48, '48023'), ('Oued Essalem', 48, '48024'), ('Oued Rhiou', 48, '48025'), ('Ouled Aiche', 48, '48026'), ('Ouled Sidi Mihoub', 48, '48027'), ('Ramka', 48, '48028'), ('Relizane', 48, '48029'), ('Sidi Khettab', 48, '48030'), ('Sidi Lazreg', 48, '48031'), ('Sidi M''Hamed Ben Ali', 48, '48032'), ('Sidi M''Hamed Benaouda', 48, '48033'), ('Sidi Saada', 48, '48034'), ('Souk El Had', 48, '48035'), ('Yellel', 48, '48036'), ('Zemmoura', 48, '48037');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Timimoun', 49, '49000'), ('Aougrout', 49, '49001'), ('Charouine', 49, '49002'), ('Deldoul', 49, '49003'), ('Metarfa', 49, '49004'), ('Ouled Aissa', 49, '49005'), ('Ouled Said', 49, '49006'), ('Talmine', 49, '49007'), ('Timimoun', 49, '49008'), ('Tinerkouk', 49, '49009');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Bordj Badji Mokhtar', 50, '50000'), ('Bordj Badji Mokhtar', 50, '50001'), ('Timiaouine', 50, '50002');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Ouled Djellal', 51, '51000'), ('Douis', 51, '51001'), ('Ouled Djellal', 51, '51002'), ('Sidi Khaled', 51, '51003'), ('Sidi Okba', 51, '51004');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Béni Abbès', 52, '52000'), ('Beni Abbes', 52, '52001'), ('Igli', 52, '52002'), ('Kerzaz', 52, '52003'), ('Ouled Khoudir', 52, '52004'), ('Tabelbala', 52, '52005'), ('Tamtert', 52, '52006'), ('Zaouia El Abidia', 52, '52007');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('In Salah', 53, '53000'), ('In Salah', 53, '53001'), ('Foggaret Ezzaouia', 53, '53002');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('In Guezzam', 54, '54000'), ('In Guezzam', 54, '54001'), ('Tin Zaouatine', 54, '54002');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Touggourt', 55, '55000'), ('Blidet Amor', 55, '55001'), ('El Alia', 55, '55002'), ('El Hadjira', 55, '55003'), ('Megarine', 55, '55004'), ('M''Naguar', 55, '55005'), ('Nezla', 55, '55006'), ('Sidi Slimane', 55, '55007'), ('Taibet', 55, '55008'), ('Tebesbest', 55, '55009'), ('Touggourt', 55, '55010'), ('Zaouia El Abidia', 55, '55011');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('Djanet', 56, '56000'), ('Bordj El Haouas', 56, '56001'), ('Djanet', 56, '56002');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('El M''Ghair', 57, '57001'), ('Oum Touyour', 57, '57002'), ('Still', 57, '57003');
INSERT INTO city (name, wilaya_id, zip_code) VALUES 
('El Meniaa', 58, '58001'), ('Hassi Fehal', 58, '58002'), ('Hassi Gara', 58, '58003');

INSERT INTO features (name) VALUES
('Android Auto'),
('Auto Pilot'),
('GPS Nav System'),
('Air Conditioner'),
('Heated Seats'),
('Sunroof'),
('Backup Camera'),
('Cruise Control');

-- Insert office locations
INSERT INTO office (country, wilaya, city, address, open_time, close_time, latitude, longitude) VALUES
('Algeria', 'Algiers', 'Algiers', '123 Rue Didouche Mourad', '08:00:00', '22:00:00', 36.7538, 3.0588),
('Algeria', 'Oran', 'Oran', '456 Boulevard de la Soummam', '08:00:00', '22:00:00', 35.6971, -0.6337),
('Algeria', 'Constantine', 'Constantine', '789 Avenue Aissat Idir', '09:00:00', '21:00:00', 36.3650, 6.6147),
('Algeria', 'Annaba', 'Annaba', '101 Boulevard du 1er Novembre', '08:30:00', '21:30:00', 36.9009, 7.7567),
('Algeria', 'Tizi Ouzou', 'Tizi Ouzou', '202 Rue Abane Ramdane', '08:00:00', '20:00:00', 36.7167, 4.0500),
('Algeria', 'Ghardaia', 'El Atteuf', 'El Atteuf', '08:00:00', '20:00:00', 32.3984, 3.7561);

INSERT INTO users (email, username, password, fname, lname, sexe, address, wilaya, city, zipcode, phone, account_status, phone_status, birthdate, role, image, office_id) VALUES
('odaydid002@gmail.com', 'odaydid002', '$2b$10$YhK7bKZ3X9XPihdMHA07h.7Tin4kXIfG1sfa2Bcd4jElyy6HdIYHS', 'Oudai', 'Oulhadj', 'M', '110 Logement', 'El Menia', 'El Menia', '58001', '+213553728440', FALSE, FALSE, '2002-04-29', 'Admin', 'https://res.cloudinary.com/dnzuqdajo/image/upload/v1743722872/profile_images/image-1743722869237.png', 1);

-- Insert car brands
INSERT INTO brands (name, logo) VALUES
('Volkswagen', '/assets/cars/volkswagen.png'),
('Seat', '/assets/cars/seat.png'),
('BMW', '/assets/cars/bmw.png'),
('Audi', '/assets/cars/audi.png'),
('Dacia', '/assets/cars/dacia.png'),
('Tesla', '/assets/cars/tesla.png'),
('Skoda', '/assets/cars/skoda.png'),
('Peugeot', '/assets/cars/peugeot.png'),
('Hyundai', '/assets/cars/hyundai.png'),
('Kia', '/assets/cars/kia.png'),
('Mazda', '/assets/cars/mazda.png'),
('Mitsubishi', '/assets/cars/mitsubishi.png'),
('Opel', '/assets/cars/opel.png'),
('Ford', '/assets/cars/ford.png'),
('Nissan', '/assets/cars/nissan.png'),
('Renault', '/assets/cars/renault.png'),
('Citroen', '/assets/cars/citroen.png'),
('Chevrolet', '/assets/cars/chevrolet.png'),
('Mercedes', '/assets/cars/mercedes.png'),
('Porsche', '/assets/cars/porsche.png'),
('Aplfa romeo', '/assets/cars/aplfa romeo.png');


-- Insert vehicles
INSERT INTO vehicles (image, prevImage1, prevImage2, prevImage3, brand_id, model, fab_year, color, capacity, doors, fuel, transmission, body, price, speed, horsepower, engine_type, rental_type, description) VALUES
('/assets/car/Astra.png', '/assets/car/Astra (1).jpg', '/assets/car/Astra (2).jpg', '/assets/car/Astra (3).jpg', 13, 'Astra', 2018, 'Silver', 5, 4, 'Gasoline', 'Manual', 'Hatchback', 12500.00, 185, 140, '1.4L Turbo', 'h', 'Practical hatchback with good fuel economy'),
('/assets/car/Insignia.png', '/assets/car/Insignia (1).jpg', '/assets/car/Insignia (2).jpg', '/assets/car/Insignia (3).jpg', 13, 'Insignia', 2019, 'Black', 5, 4, 'Diesel', 'Automatic', 'Sedan', 18900.00, 210, 170, '2.0L Turbo', 'd', 'Comfortable executive sedan'),
('/assets/car/Corsa.png', '/assets/car/Corsa (1).jpg', '/assets/car/Corsa (2).jpg', '/assets/car/Corsa (3).jpg', 13, 'Corsa', 2020, 'Blue', 5, 4, 'Petrol', 'Manual', 'Hatchback', 9500.00, 165, 75, '1.2L', 'h', 'Economical city car'),
('/assets/car/Mokka.png', '/assets/car/Mokka (1).jpg', '/assets/car/Mokka (2).jpg', '/assets/car/Mokka (3).jpg', 13, 'Mokka', 2021, 'White', 5, 4, 'Hybrid', 'Automatic', 'SUV', 22500.00, 180, 136, '1.6L Hybrid', 'd', 'Compact SUV with hybrid option'),
('/assets/car/Clio.png', '/assets/car/Clio (1).jpg', '/assets/car/Clio (2).jpg', '/assets/car/Clio (3).jpg', 16, 'Clio', 2020, 'Red', 5, 4, 'Petrol', 'Manual', 'Hatchback', 14900.00, 175, 90, '1.2L', 'h', 'Popular city car with agile handling'),
('/assets/car/Megane.png', '/assets/car/Megane (1).jpg', '/assets/car/Megane (2).jpg', '/assets/car/Megane (3).jpg', 16, 'Megane', 2019, 'Gray', 5, 4, 'Diesel', 'Automatic', 'Sedan', 17900.00, 205, 110, '1.5L Turbo', 'd', 'Stylish family sedan'),
('/assets/car/Captur.png', '/assets/car/Captur (1).jpg', '/assets/car/Captur (2).jpg', '/assets/car/Captur (3).jpg', 16, 'Captur', 2021, 'Orange', 5, 4, 'Gasoline', 'Manual', 'SUV', 19900.00, 185, 130, '1.3L Turbo', 'h', 'Compact crossover SUV'),
('/assets/car/Zoe.png', '/assets/car/Zoe (1).jpg', '/assets/car/Zoe (2).jpg', '/assets/car/Zoe (3).jpg', 16, 'Zoe', 2022, 'Green', 5, 4, 'Electric', 'Automatic', 'Hatchback', 24900.00, 135, 136, 'Electric', 'h', 'All-electric city car'),
('/assets/car/Leaf.png', '/assets/car/Leaf (1).jpg', '/assets/car/Leaf (2).jpg', '/assets/car/Leaf (3).jpg', 15, 'Leaf', 2021, 'Blue', 5, 4, 'Electric', 'Automatic', 'Hatchback', 25900.00, 150, 150, 'Electric', 'h', 'Pioneering electric vehicle'),
('/assets/car/Qashqai.png', '/assets/car/Qashqai (1).jpg', '/assets/car/Qashqai (2).jpg', '/assets/car/Qashqai (3).jpg', 15, 'Qashqai', 2019, 'Gray', 5, 4, 'Hybrid', 'Automatic', 'SUV', 28900.00, 180, 190, '1.5L Hybrid', 'd', 'Popular crossover with hybrid option'),
('/assets/car/Micra.png', '/assets/car/Micra (1).jpg', '/assets/car/Micra (2).jpg', '/assets/car/Micra (3).jpg', 15, 'Micra', 2020, 'Yellow', 5, 4, 'Petrol', 'Manual', 'Hatchback', 12900.00, 165, 90, '1.0L Turbo', 'h', 'Compact city car with personality'),
('/assets/car/X-Trail.png', '/assets/car/X-Trail (1).jpg', '/assets/car/X-Trail (2).jpg', '/assets/car/X-Trail (3).jpg', 15, 'X-Trail', 2018, 'White', 7, 4, 'Diesel', 'Automatic', 'SUV', 24500.00, 195, 177, '2.0L Turbo', 'd', 'Seven-seat family SUV'),
('/assets/car/MX-5.png', '/assets/car/MX-5 (1).jpg', '/assets/car/MX-5 (2).jpg', '/assets/car/MX-5 (3).jpg', 11, 'MX-5', 2017, 'Red', 2, 2, 'Petrol', 'Manual', 'Sport', 22500.00, 220, 160, '2.0L', 'h', 'Iconic roadster for driving enthusiasts'),
('/assets/car/CX-5.png', '/assets/car/CX-5 (1).jpg', '/assets/car/CX-5 (2).jpg', '/assets/car/CX-5 (3).jpg', 11, 'CX-5', 2019, 'Black', 5, 4, 'Diesel', 'Automatic', 'SUV', 27500.00, 200, 184, '2.2L Turbo', 'd', 'Premium midsize SUV'),
('/assets/car/3.png', '/assets/car/3 (1).jpg', '/assets/car/3 (2).jpg', '/assets/car/3 (3).jpg', 11, '3', 2020, 'Blue', 5, 4, 'Gasoline', 'Automatic', 'Sedan', 19900.00, 195, 122, '1.5L Turbo', 'h', 'Sporty compact sedan'),
('/assets/car/2.png', '/assets/car/2 (1).jpg', '/assets/car/2 (2).jpg', '/assets/car/2 (3).jpg', 11, '2', 2018, 'White', 4, 4, 'Petrol', 'Manual', 'Hatchback', 11500.00, 170, 75, '1.5L', 'h', 'Economical supermini'),
('/assets/car/A3.png', '/assets/car/A3 (1).jpg', '/assets/car/A3 (2).jpg', '/assets/car/A3 (3).jpg', 4, 'A3', 2019, 'Silver', 5, 4, 'Gasoline', 'Automatic', 'Sedan', 22900.00, 210, 150, '1.5L Turbo', 'h', 'Premium compact sedan'),
('/assets/car/Q5.png', '/assets/car/Q5 (1).jpg', '/assets/car/Q5 (2).jpg', '/assets/car/Q5 (3).jpg', 4, 'Q5', 2020, 'Black', 5, 4, 'Diesel', 'Automatic', 'SUV', 34900.00, 220, 190, '2.0L Turbo', 'd', 'Luxury midsize SUV'),
('/assets/car/e-tron.png', '/assets/car/e-tron (1).jpg', '/assets/car/e-tron (2).jpg', '/assets/car/e-tron (3).jpg', 4, 'e-tron', 2021, 'Blue', 5, 4, 'Electric', 'Automatic', 'SUV', 45900.00, 200, 355, 'Electric', 'd', 'Premium electric SUV'),
('/assets/car/TT.png', '/assets/car/TT (1).jpg', '/assets/car/TT (2).jpg', '/assets/car/TT (3).jpg', 4, 'TT', 2018, 'Red', 2, 2, 'Petrol', 'Automatic', 'Coupe', 32500.00, 250, 230, '2.0L Turbo', 'h', 'Sporty two-door coupe'),
('/assets/car/1 Series.png', '/assets/car/1 Series (1).jpg', '/assets/car/1 Series (2).jpg', '/assets/car/1 Series (3).jpg', 3, '1 Series', 2019, 'White', 5, 4, 'Gasoline', 'Manual', 'Hatchback', 21500.00, 205, 140, '1.5L Turbo', 'h', 'Premium compact hatchback'),
('/assets/car/X3.png', '/assets/car/X3 (1).jpg', '/assets/car/X3 (2).jpg', '/assets/car/X3 (3).jpg', 3, 'X3', 2020, 'Black', 5, 4, 'Diesel', 'Automatic', 'SUV', 38900.00, 215, 190, '2.0L Turbo', 'd', 'Sporty midsize SUV'),
('/assets/car/i3.png', '/assets/car/i3 (1).jpg', '/assets/car/i3 (2).jpg', '/assets/car/i3 (3).jpg', 3, 'i3', 2021, 'Blue', 4, 4, 'Electric', 'Automatic', 'Hatchback', 32900.00, 150, 170, 'Electric', 'h', 'Innovative electric city car'),
('/assets/car/Z4.png', '/assets/car/Z4 (1).jpg', '/assets/car/Z4 (2).jpg', '/assets/car/Z4 (3).jpg', 3, 'Z4', 2019, 'Red', 2, 2, 'Petrol', 'Automatic', 'Sport', 42500.00, 250, 197, '2.0L Turbo', 'h', 'Roadster with sporty performance'),
('/assets/car/A-Class.png', '/assets/car/A-Class (1).jpg', '/assets/car/A-Class (2).jpg', '/assets/car/A-Class (3).jpg', 19, 'A-Class', 2020, 'Silver', 5, 4, 'Gasoline', 'Automatic', 'Sedan', 28500.00, 210, 163, '1.3L Turbo', 'h', 'Premium compact sedan'),
('/assets/car/GLC.png', '/assets/car/GLC (1).jpg', '/assets/car/GLC (2).jpg', '/assets/car/GLC (3).jpg', 19, 'GLC', 2019, 'Black', 5, 4, 'Diesel', 'Automatic', 'SUV', 42900.00, 220, 194, '2.0L Turbo', 'd', 'Luxury midsize SUV'),
('/assets/car/EQC.png', '/assets/car/EQC (1).jpg', '/assets/car/EQC (2).jpg', '/assets/car/EQC (3).jpg', 19, 'EQC', 2021, 'Blue', 5, 4, 'Electric', 'Automatic', 'SUV', 49900.00, 180, 408, 'Electric', 'd', 'Mercedes electric SUV'),
('/assets/car/C-Class.png', '/assets/car/C-Class (1).jpg', '/assets/car/C-Class (2).jpg', '/assets/car/C-Class (3).jpg', 19, 'C-Class', 2018, 'White', 5, 4, 'Gasoline', 'Automatic', 'Sedan', 29500.00, 230, 184, '2.0L Turbo', 'h', 'Executive business sedan'),
('/assets/car/911.png', '/assets/car/911 (1).jpg', '/assets/car/911 (2).jpg', '/assets/car/911 (3).jpg', 20, '911', 2019, 'Red', 2, 2, 'Petrol', 'Automatic', 'Sport', 49900.00, 293, 385, '3.0L Turbo', 'h', 'Iconic sports car'),
('/assets/car/Cayenne.png', '/assets/car/Cayenne (1).jpg', '/assets/car/Cayenne (2).jpg', '/assets/car/Cayenne (3).jpg', 20, 'Cayenne', 2020, 'Black', 5, 4, 'Hybrid', 'Automatic', 'SUV', 48900.00, 240, 340, '3.0L Hybrid', 'd', 'Performance SUV with hybrid option'),
('/assets/car/Taycan.png', '/assets/car/Taycan (1).jpg', '/assets/car/Taycan (2).jpg', '/assets/car/Taycan (3).jpg', 20, 'Taycan', 2021, 'Blue', 4, 4, 'Electric', 'Automatic', 'Sedan', 49900.00, 230, 408, 'Electric', 'h', 'High-performance electric sedan'),
('/assets/car/Macan.png', '/assets/car/Macan (1).jpg', '/assets/car/Macan (2).jpg', '/assets/car/Macan (3).jpg', 20, 'Macan', 2019, 'White', 5, 4, 'Gasoline', 'Automatic', 'SUV', 42900.00, 230, 252, '2.0L Turbo', 'd', 'Compact luxury SUV'),
('/assets/car/Giulia.png', '/assets/car/Giulia (1).jpg', '/assets/car/Giulia (2).jpg', '/assets/car/Giulia (3).jpg', 21, 'Giulia', 2020, 'Red', 5, 4, 'Gasoline', 'Automatic', 'Sedan', 34900.00, 240, 200, '2.0L Turbo', 'h', 'Italian sport sedan'),
('/assets/car/Stelvio.png', '/assets/car/Stelvio (1).jpg', '/assets/car/Stelvio (2).jpg', '/assets/car/Stelvio (3).jpg', 21, 'Stelvio', 2019, 'Black', 5, 4, 'Diesel', 'Automatic', 'SUV', 39900.00, 215, 210, '2.2L Turbo', 'd', 'Performance-oriented SUV'),
('/assets/car/MiTo.png', '/assets/car/MiTo (1).jpg', '/assets/car/MiTo (2).jpg', '/assets/car/MiTo (3).jpg', 21, 'MiTo', 2018, 'Blue', 4, 4, 'Petrol', 'Manual', 'Hatchback', 14900.00, 190, 120, '1.4L Turbo', 'h', 'Sporty compact hatchback'),
('/assets/car/Giulietta.png', '/assets/car/Giulietta (1).jpg', '/assets/car/Giulietta (2).jpg', '/assets/car/Giulietta (3).jpg', 21, 'Giulietta', 2017, 'White', 5, 4, 'Gasoline', 'Manual', 'Hatchback', 16500.00, 205, 170, '1.8L Turbo', 'h', 'Performance hatchback'),
('/assets/car/Duster.png', '/assets/car/Duster (1).jpg', '/assets/car/Duster (2).jpg', '/assets/car/Duster (3).jpg', 5, 'Duster', 2020, 'Orange', 5, 4, 'Diesel', 'Manual', 'Off-Road', 18900.00, 175, 115, '1.5L Turbo', 'd', 'Affordable off-road capable SUV'),
('/assets/car/Sandero.png', '/assets/car/Sandero (1).jpg', '/assets/car/Sandero (2).jpg', '/assets/car/Sandero (3).jpg', 5, 'Sandero', 2021, 'Red', 5, 4, 'Petrol', 'Manual', 'Hatchback', 9500.00, 165, 90, '1.0L', 'h', 'Budget-friendly city car'),
('/assets/car/Logan.png', '/assets/car/Logan (1).jpg', '/assets/car/Logan (2).jpg', '/assets/car/Logan (3).jpg', 5, 'Logan', 2019, 'Gray', 5, 4, 'Gasoline', 'Manual', 'Sedan', 11500.00, 170, 90, '1.2L', 'h', 'Practical budget sedan'),
('/assets/car/Jogger.png', '/assets/car/Jogger (1).jpg', '/assets/car/Jogger (2).jpg', '/assets/car/Jogger (3).jpg', 5, 'Jogger', 2022, 'Blue', 7, 4, 'Hybrid', 'Manual', 'Van', 19900.00, 165, 140, '1.6L Hybrid', 'd', 'Seven-seat family hybrid');

INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (1, 1, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (2, 2, 1);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (3, 3, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (4, 4, 5);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (5, 5, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (6, 6, 3);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (7, 1, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (8, 2, 1);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (9, 3, 4);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (10, 4, 3);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (11, 5, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (12, 6, 1);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (13, 1, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (14, 2, 5);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (15, 3, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (16, 4, 3);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (17, 5, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (18, 6, 1);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (19, 1, 4);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (20, 2, 3);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (21, 3, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (22, 4, 1);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (23, 5, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (24, 6, 5);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (25, 1, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (26, 2, 3);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (27, 3, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (28, 4, 1);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (29, 5, 4);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (30, 6, 3);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (31, 1, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (32, 2, 1);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (33, 3, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (34, 4, 5);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (35, 5, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (36, 6, 3);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (37, 1, 2);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (38, 2, 1);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (39, 3, 4);
INSERT INTO public.vehicle_stock (vehicle_id, office_id, units) VALUES (40, 4, 3);

INSERT INTO coupons (code, value, usage_limit, expires_at, created_at) VALUES
('WELCOME10', 10, 1, '2024-12-31 23:59:59', '2023-01-01 00:00:00'),
('SAVE20', 20, 5, '2024-11-30 23:59:59', '2023-02-15 12:00:00'),
('HOLIDAY30', 30, 10, '2024-12-25 23:59:59', '2023-05-01 08:30:00'),
('SPRING15', 15, 3, '2025-06-15 23:59:59', '2025-03-20 09:00:00'),
('FREESHIP', 0, 100, '2025-08-01 23:59:59', '2025-04-10 10:45:00');

INSERT INTO promo (value, expires_at, created_at) VALUES
(5, '2025-07-01 23:59:59', '2025-03-01 10:00:00'),
(10, '2025-09-30 23:59:59', '2025-04-01 11:30:00'),
(15, '2025-06-30 23:59:59', '2025-05-01 14:00:00'),
(25, '2025-12-31 23:59:59', '2025-01-10 09:15:00'),
(50, '2025-11-15 23:59:59', '2025-02-25 13:45:00');


