import React from 'react';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import api from '../../services/api';
import Dropzone from '../../components/Dropzone';

import './styles.css';
import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  name: string;
  image_url: string;
}

interface IBGERes {
  sigla: string;
}

interface IBGECityRes {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = React.useState<Item[]>([]);
  const [ufs, setUfs] = React.useState<string[]>([]);
  const [cities, setCities] = React.useState<string[]>([]);

  const [initialPosition, setInitialPosition] = React.useState<
    [number, number]
  >([0, 0]);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const [selectedFile, setSelectedFile] = React.useState<File>();
  const [selectedPosition, setSelectedPosition] = React.useState<
    [number, number]
  >([0, 0]);
  const [selectedUf, setSelectedUf] = React.useState<string>('0');
  const [selectedCity, setSelectedCity] = React.useState<string>('0');
  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);

  const history = useHistory();

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) =>
      setInitialPosition([position.coords.latitude, position.coords.longitude])
    );
  }, []);

  React.useEffect(() => {
    api.get('items').then((res) => {
      setItems(res.data);
    });
  }, []);

  React.useEffect(() => {
    axios
      .get<IBGERes[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados/'
      )
      .then((res) => {
        const Ufinitials = res.data.map((uf) => uf.sigla);
        setUfs(Ufinitials);
      });
  }, []);

  React.useEffect(() => {
    if (selectedUf === '0') return;

    axios
      .get<IBGECityRes[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((res) => {
        const cityNames = res.data.map((uf) => uf.nome);
        setCities(cityNames);
      });
  }, [selectedUf]);

  const handleSelectUf = (event: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedUf(event.target.value);

  const handleSelectCity = (event: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedCity(event.target.value);

  const handleOnMapClick = (event: LeafletMouseEvent) =>
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectItem = (id: number) => {
    const alreadySelected = selectedItems.findIndex((item) => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);

      setSelectedItems(filteredItems);
    } else setSelectedItems([...selectedItems, id]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const [latitude, longitude] = selectedPosition;
    const uf = selectedUf;
    const city = selectedCity;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('uf', uf);
    data.append('city', city);
    data.append('items', items.join(','));
    if (selectedFile) data.append('image', selectedFile);

    await api.post('points', data);

    alert('Ponto de coleta criado com suceso');

    history.push('/');
  };

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onclick={handleOnMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectUf}
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt="teste" />
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
