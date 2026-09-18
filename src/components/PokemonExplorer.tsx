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

// Paleta oficial de colores por tipo de Pokémon
const COLOR_TIPOS: Record<string, { base: string; oscuro: string; claro: string }> = {
  normal: { base: '#A8A878', oscuro: '#6D6D4E', claro: '#C6C6A7' },
  fire: { base: '#F08030', oscuro: '#9C531F', claro: '#F5AC78' },
  water: { base: '#6890F0', oscuro: '#445E9C', claro: '#9DB7F5' },
  electric: { base: '#F8D030', oscuro: '#A1871F', claro: '#FAE078' },
  grass: { base: '#78C850', oscuro: '#4E8234', claro: '#A7DB8D' },
  ice: { base: '#98D8D8', oscuro: '#638D8D', claro: '#BCE6E6' },
  fighting: { base: '#C03028', oscuro: '#7D1F1A', claro: '#D67873' },
  poison: { base: '#A040A0', oscuro: '#682A68', claro: '#C183C1' },
  ground: { base: '#E0C068', oscuro: '#927D44', claro: '#EBD69D' },
  flying: { base: '#A890F0', oscuro: '#6D5E9C', claro: '#C6B7F5' },
  psychic: { base: '#F85888', oscuro: '#A13959', claro: '#FA92B2' },
  bug: { base: '#A8B820', oscuro: '#6D7815', claro: '#C6D16E' },
  rock: { base: '#B8A038', oscuro: '#786824', claro: '#D1C17D' },
  ghost: { base: '#705898', oscuro: '#493963', claro: '#A292BC' },
  dragon: { base: '#7038F8', oscuro: '#4924A1', claro: '#A27DFA' },
  dark: { base: '#705848', oscuro: '#49392F', claro: '#A29288' },
  steel: { base: '#B8B8D0', oscuro: '#787887', claro: '#D1D1E0' },
  fairy: { base: '#EE99AC', oscuro: '#9B6470', claro: '#F4BDC9' },
};

function coloresDe(pokemon: PokemonDetail) {
  const principal = COLOR_TIPOS[pokemon.types[0]?.type.name] ?? COLOR_TIPOS.normal;
  const secundario = COLOR_TIPOS[pokemon.types[1]?.type.name] ?? principal;
  return { principal, secundario };
}

function InfoItem({
  label,
  value,
  colorAcento,
}: {
  label: string;
  value: string;
  colorAcento: string;
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
      <p
        className="text-[11px] font-bold tracking-widest uppercase"
        style={{ color: colorAcento }}
      >
        {label}
      </p>
      <p className="text-lg font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function PokemonCard({ pokemon }: { pokemon: PokemonDetail }) {
  const imagen =
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default;

  const { principal, secundario } = coloresDe(pokemon);
  const gradienteHeader = `linear-gradient(135deg, ${principal.base} 0%, ${secundario.oscuro} 100%)`;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-[fadeIn_0.3s_ease-out]">
      {/* Encabezado con gradiente según el tipo */}
      <div
        className="relative px-6 pt-6 pb-16 text-white overflow-hidden"
        style={{ background: gradienteHeader }}
      >
        {/* Manchas decorativas */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />

        <p className="text-sm font-semibold tracking-widest opacity-80 relative">
          #{String(pokemon.id).padStart(3, '0')}
        </p>
        <h2 className="text-3xl font-extrabold capitalize relative drop-shadow-sm">
          {pokemon.name}
        </h2>
        <div className="flex gap-2 mt-3 relative">
          {pokemon.types.map((item) => (
            <span
              key={item.type.name}
              className="backdrop-blur-sm bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full capitalize shadow-sm"
            >
              {item.type.name}
            </span>
          ))}
        </div>
      </div>

      {/* Imagen flotante superpuesta al encabezado */}
      <div className="flex justify-center -mt-20 relative">
        <div
          className="flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-lg border-4"
          style={{ boxShadow: `0 10px 30px -5px ${principal.base}80`, borderColor: principal.claro }}
        >
          <img
            src={imagen}
            alt={pokemon.name}
            className="h-32 w-32 object-contain drop-shadow-lg"
          />
        </div>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-2 gap-3 p-6 pt-4">
        <InfoItem label="Altura" value={`${pokemon.height / 10} m`} colorAcento={principal.oscuro} />
        <InfoItem label="Peso" value={`${pokemon.weight / 10} kg`} colorAcento={principal.oscuro} />
      </div>

      {/* Habilidades */}
      <div className="px-6 pb-5">
        <h3 className="text-sm font-bold text-slate-700 mb-2">Habilidades</h3>
        <div className="flex flex-wrap gap-2">
          {pokemon.abilities.map((item) => (
            <span
              key={item.ability.name}
              className="text-xs font-semibold px-3 py-1 rounded-full capitalize border"
              style={{
                color: principal.oscuro,
                backgroundColor: `${principal.claro}40`,
                borderColor: `${principal.claro}80`,
              }}
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
                  <span className="font-medium">
                    {NOMBRES_STATS[item.stat.name] ?? item.stat.name}
                  </span>
                  <span className="font-bold" style={{ color: principal.oscuro }}>
                    {item.base_stat}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${porcentaje}%`,
                      background: `linear-gradient(90deg, ${principal.claro}, ${principal.base})`,
                    }}
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

  const colorSeleccionado = detalle ? coloresDe(detalle).principal : null;

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
    <div
      className="min-h-screen p-8 transition-colors duration-700"
      style={{
        background: colorSeleccionado
          ? `linear-gradient(180deg, ${colorSeleccionado.claro}25 0%, #f1f5f9 320px)`
          : '#f1f5f9',
      }}
    >
      <button
        onClick={onRegresar}
        className="mb-6 bg-white text-slate-600 hover:text-slate-900 hover:shadow-md font-semibold text-sm px-4 py-2 rounded-full shadow-sm border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all w-fit"
      >
        <span className="text-base leading-none">←</span> Regresar
      </button>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        {/* Lista de Pokémon */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-4 flex flex-col max-h-[80vh] border border-slate-100">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-extrabold text-slate-800 text-lg">Pokémon</h2>
            <span className="text-xs font-bold bg-slate-800 text-white px-2.5 py-1 rounded-full">
              {pokemonList.length}
            </span>
          </div>

          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar Pokémon..."
              className="w-full pl-9 pr-3 py-2.5 rounded-full bg-slate-100 border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            />
          </div>

          <div className="overflow-y-auto space-y-1.5 pr-1">
            {listaFiltrada.map((p) => {
              const activo = seleccionado === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setSeleccionado(p.name)}
                  style={
                    activo && colorSeleccionado
                      ? { background: `linear-gradient(135deg, ${colorSeleccionado.base}, ${colorSeleccionado.oscuro})` }
                      : undefined
                  }
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-sm capitalize flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    activo
                      ? 'text-white font-semibold shadow-md scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:translate-x-0.5'
                  }`}
                >
                  {p.name}
                  <span className={activo ? 'opacity-90' : 'opacity-40'}>→</span>
                </button>
              );
            })}
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
            <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-slate-400 animate-pulse">
              Cargando Pokémon...
            </div>
          )}
          {!cargandoDetalle && detalle && <PokemonCard pokemon={detalle} />}
          {!cargandoDetalle && !detalle && (
            <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-slate-400">
              Selecciona un Pokémon de la lista
            </div>
          )}
        </div>
      </div>
    </div>
  );
}