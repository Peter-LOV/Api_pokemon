import { useEffect, useState } from 'react';

interface PokemonListItem {
  name: string;
  url: string;
}

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    other?: {
      'official-artwork'?: {
        front_default: string;
      };
    };
  };
  types: { slot: number; type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

interface Props {
  pokemonList: PokemonListItem[];
  onRegresar: () => void;
}

const NOMBRES_STATS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Special Attack',
  'special-defense': 'Special Defense',
  speed: 'Speed',
};

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-100 rounded-lg p-4 text-center">
      <p className="text-xs font-semibold text-slate-500 tracking-wide">{label}</p>
      <p className="text-lg font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function PokemonCard({ pokemon }: { pokemon: PokemonDetail }) {
  const imagen =
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Encabezado */}
      <div className="bg-blue-600 text-white p-6">
        <p className="text-sm opacity-80">#{String(pokemon.id).padStart(3, '0')}</p>
        <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
        <div className="flex gap-2 mt-2">
          {pokemon.types.map((item) => (
            <span
              key={item.type.name}
              className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize"
            >
              {item.type.name}
            </span>
          ))}
        </div>
      </div>

      {/* Imagen */}
      <div className="flex justify-center -mt-2 pt-6">
        <div className="flex h-64 w-64 items-center justify-center rounded-full bg-gray-50 shadow-inner">
          <img
            src={imagen}
            alt={pokemon.name}
            className="h-56 w-56 object-contain drop-shadow-lg"
          />
        </div>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-2 gap-4 p-6">
        <InfoItem label="ALTURA" value={`${pokemon.height / 10} m`} />
        <InfoItem label="PESO" value={`${pokemon.weight / 10} kg`} />
      </div>

      {/* Habilidades */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-2">Habilidades</h3>
        <div className="flex flex-wrap gap-2">
          {pokemon.abilities.map((item) => (
            <span
              key={item.ability.name}
              className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full capitalize"
            >
              {item.ability.name.replace('-', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Estadísticas</h3>
        <div className="space-y-3">
          {pokemon.stats.map((item) => {
            const porcentaje = Math.min(100, (item.base_stat / 150) * 100);
            return (
              <div key={item.stat.name}>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>{NOMBRES_STATS[item.stat.name] ?? item.stat.name}</span>
                  <span className="font-semibold">{item.base_stat}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PokemonExplorer({ pokemonList, onRegresar }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<PokemonDetail | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const listaFiltrada = pokemonList.filter((p) =>
    p.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Selecciona el primer Pokémon automáticamente al entrar a la vista
  useEffect(() => {
    if (pokemonList.length > 0 && !seleccionado) {
      setSeleccionado(pokemonList[0].name);
    }
  }, [pokemonList, seleccionado]);

  // Trae el detalle cada vez que cambia el Pokémon seleccionado
  useEffect(() => {
    if (!seleccionado) return;
    setCargandoDetalle(true);
    fetch(`https://pokeapi.co/api/v2/pokemon/${seleccionado}`)
      .then((respuesta) => respuesta.json())
      .then((datos) => setDetalle(datos))
      .catch((error) => console.error('Error al cargar el detalle del Pokémon', error))
      .finally(() => setCargandoDetalle(false));
  }, [seleccionado]);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <button
        onClick={onRegresar}
        className="mb-6 text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
      >
        ← Regresar
      </button>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        {/* Lista de Pokémon */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800">Pokémon</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
              {pokemonList.length}
            </span>
          </div>

          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar Pokémon..."
            className="w-full mb-3 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="overflow-y-auto space-y-1 pr-1">
            {listaFiltrada.map((p) => (
              <button
                key={p.name}
                onClick={() => setSeleccionado(p.name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize flex items-center justify-between transition-colors cursor-pointer ${
                  seleccionado === p.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.name}
                <span>→</span>
              </button>
            ))}
            {listaFiltrada.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No se encontraron resultados
              </p>
            )}
          </div>
        </div>

        {/* Panel de detalle */}
        <div>
          {cargandoDetalle && (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-400">
              Cargando Pokémon...
            </div>
          )}
          {!cargandoDetalle && detalle && <PokemonCard pokemon={detalle} />}
          {!cargandoDetalle && !detalle && (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-400">
              Selecciona un Pokémon de la lista
            </div>
          )}
        </div>
      </div>
    </div>
  );
}