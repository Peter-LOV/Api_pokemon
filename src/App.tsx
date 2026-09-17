import { useState, useEffect } from 'react';
import TarjetaUsuario from './components/TarjetaUsuario';
import PokemonExplorer from './components/PokemonExplorer';

interface Usuario {
  name: string;
  email: string;
  phone: string;
}

interface PokemonListItem {
  name: string;
  url: string;
}

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [vista, setVista] = useState<'inicio' | 'pokemon'>('inicio');
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);

  // Carga la lista de los primeros 151 Pokémon una sola vez
  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
      .then((respuesta) => respuesta.json())
      .then((datos) => setPokemonList(datos.results))
      .catch((error) => console.error('Error al cargar la lista de Pokémon', error));
  }, []);

  const obtenerDatos = async () => {
    setCargando(true);
    try {
      const respuesta = await fetch('https://jsonplaceholder.typicode.com/users/1');
      const datos = await respuesta.json();
      setUsuario(datos);
    } catch (error) {
      console.error("Error al consumir la API", error);
    } finally {
      setCargando(false);
    }
  };

  if (vista === 'pokemon') {
    return (
      <PokemonExplorer
        pokemonList={pokemonList}
        onRegresar={() => setVista('inicio')}
      />
    );
  }

  return (
    <div className="p-8 bg-blue-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Fundamentos de React</h1>
      <div className="flex gap-3">
        <button
          onClick={obtenerDatos}
          className="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-all cursor-pointer"
        >
          {cargando ? 'Consultando API...' : 'Obtener Usuario'}
        </button>

        <button
            onClick={() => setVista('pokemon')}
            className="bg-slate-800 text-white px-4 py-2 rounded shadow hover:bg-slate-900 transition-all cursor-pointer">
            Explorar Pokémon
        </button>
      </div>
      {usuario && (
        <TarjetaUsuario nombre={usuario.name} correo={usuario.email} telefono={usuario.phone} />
      )}
    </div>
  );
}
