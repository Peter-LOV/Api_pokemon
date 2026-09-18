import { useEffect, useMemo, useState, type MouseEvent } from 'react';

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
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Atq. especial',
  'special-defense': 'Def. especial',
  speed: 'Velocidad',
};

// Paleta oficial de colores por tipo (solo se usa como acento puntual,
// el sistema visual de la app va en morado / azul / verde)
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

// Gradiente "de marca" de la app: morado -> azul -> verde
const GRADIENTE_SISTEMA = 'linear-gradient(135deg, #a855f7 0%, #3b82f6 55%, #10b981 100%)';

function coloresDe(pokemon: PokemonDetail) {
  const principal = COLOR_TIPOS[pokemon.types[0]?.type.name] ?? COLOR_TIPOS.normal;
  return principal;
}

// El id viene incrustado en la URL del listado (".../pokemon/25/"),
// así que lo leemos de ahí en vez de pedir el detalle de los 151 de una vez.
function idDesdeUrl(url: string): number {
  const coincidencia = url.match(/\/pokemon\/(\d+)\/?$/);
  return coincidencia ? Number(coincidencia[1]) : 0;
}

function spriteDe(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// Inclinación 3D + spotlight que sigue al cursor, sin re-render:
// mutamos custom properties CSS directamente sobre el elemento.
function manejarTilt(e: MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const rx = ((y / rect.height) - 0.5) * -10;
  const ry = ((x / rect.width) - 0.5) * 10;
  el.style.setProperty('--mx', `${x}px`);
  el.style.setProperty('--my', `${y}px`);
  el.style.setProperty('--rx', `${rx}deg`);
  el.style.setProperty('--ry', `${ry}deg`);
}

function resetTilt(e: MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.style.setProperty('--rx', '0deg');
  el.style.setProperty('--ry', '0deg');
}

function ChipTipo({ tipo }: { tipo: string }) {
  const color = COLOR_TIPOS[tipo] ?? COLOR_TIPOS.normal;
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize"
      style={{ color: color.claro, borderColor: `${color.claro}55`, backgroundColor: `${color.base}22` }}
    >
      {tipo}
    </span>
  );
}

function BarraStat({ nombre, valor }: { nombre: string; valor: number }) {
  const porcentaje = Math.min(100, (valor / 150) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400 font-medium">{nombre}</span>
        <span className="text-slate-200 font-semibold">{valor}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${porcentaje}%`, background: GRADIENTE_SISTEMA }}
        />
      </div>
    </div>
  );
}

function PanelDetalle({
  pokemon,
  detalle,
  cargando,
  onCerrar,
}: {
  pokemon: PokemonListItem;
  detalle: PokemonDetail | null;
  cargando: boolean;
  onCerrar: () => void;
}) {
  const id = idDesdeUrl(pokemon.url);
  const acento = detalle ? coloresDe(detalle) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        style={{ animation: 'scrimIn 0.25s ease-out' }}
        onClick={onCerrar}
      />

      <div
        className="relative h-full w-full max-w-md bg-slate-900 border-l border-white/10 overflow-y-auto"
        style={{ animation: 'drawerIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="h-1.5 w-full" style={{ background: GRADIENTE_SISTEMA }} />

        <button
          onClick={onCerrar}
          className="absolute top-5 right-5 h-9 w-9 grid place-items-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="px-7 pt-8 pb-10">
          <span className="text-xs font-mono text-slate-500">
            N.° {String(id).padStart(3, '0')}
          </span>

          <div className="relative h-56 grid place-items-center my-4">
            <div
              className="absolute h-40 w-40 rounded-full blur-3xl opacity-40"
              style={{ background: acento ? acento.base : '#8b5cf6' }}
            />
            {cargando ? (
              <div className="relative h-16 w-16 rounded-full border-2 border-white/10 border-t-purple-400 animate-spin" />
            ) : (
              <img
                src={spriteDe(id)}
                alt={pokemon.name}
                className="relative h-48 w-48 object-contain drop-shadow-2xl animate-[fadeIn_0.4s_ease-out]"
              />
            )}
          </div>

          <h2 className="text-3xl font-bold capitalize text-white text-center tracking-tight">
            {pokemon.name}
          </h2>

          {!cargando && detalle && (
            <>
              <div className="flex justify-center gap-2 mt-3">
                {detalle.types.map((t) => (
                  <ChipTipo key={t.type.name} tipo={t.type.name} />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="rounded-xl bg-white/5 border border-white/10 py-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Altura</p>
                  <p className="text-lg font-semibold text-white mt-0.5">{detalle.height / 10} m</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 py-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Peso</p>
                  <p className="text-lg font-semibold text-white mt-0.5">{detalle.weight / 10} kg</p>
                </div>
              </div>

              <div className="mt-7">
                <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-2.5">
                  Habilidades
                </p>
                <div className="flex flex-wrap gap-2">
                  {detalle.abilities.map((a) => (
                    <span
                      key={a.ability.name}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 capitalize"
                    >
                      {a.ability.name.replace('-', ' ')}
                      {a.is_hidden && <span className="text-slate-500"> · oculta</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-7 space-y-3.5">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Estadísticas base
                </p>
                {detalle.stats.map((s) => (
                  <BarraStat
                    key={s.stat.name}
                    nombre={NOMBRES_STATS[s.stat.name] ?? s.stat.name}
                    valor={s.base_stat}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PokemonExplorer({ pokemonList, onRegresar }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState<PokemonListItem | null>(null);
  const [detalle, setDetalle] = useState<PokemonDetail | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const listaFiltrada = useMemo(
    () => pokemonList.filter((p) => p.name.toLowerCase().includes(busqueda.toLowerCase())),
    [pokemonList, busqueda]
  );

  // Solo se pide el detalle completo del Pokémon que se abre en el panel,
  // no de los 151 a la vez.
  useEffect(() => {
    if (!abierto) return;
    setDetalle(null);
    setCargandoDetalle(true);
    fetch(`https://pokeapi.co/api/v2/pokemon/${abierto.name}`)
      .then((respuesta) => respuesta.json())
      .then((datos) => setDetalle(datos))
      .catch((error) => console.error('Error al cargar el detalle del Pokémon', error))
      .finally(() => setCargandoDetalle(false));
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const cerrarConEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(null);
    };
    window.addEventListener('keydown', cerrarConEsc);
    return () => window.removeEventListener('keydown', cerrarConEsc);
  }, [abierto]);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Fondo: orbes de color a la deriva, sistema morado / azul / verde */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-purple-600/25 blur-[100px]"
          style={{ animation: 'orbFloatA 18s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-blue-600/20 blur-[110px]"
          style={{ animation: 'orbFloatB 22s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-emerald-500/20 blur-[100px]"
          style={{ animation: 'orbFloatC 20s ease-in-out infinite' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={onRegresar}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span className="h-8 w-8 grid place-items-center rounded-full bg-white/5 border border-white/10">
              ←
            </span>
            Volver
          </button>

          <div className="relative w-full max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">⌕</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar Pokémon"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400/50 focus:bg-white/[0.07] transition-colors"
            />
          </div>
        </div>

        <div className="mb-9">
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: GRADIENTE_SISTEMA }}
          >
            Pokédex
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            {listaFiltrada.length} de {pokemonList.length} Pokémon
          </p>
        </div>

        {listaFiltrada.length === 0 && (
          <p className="text-center text-slate-500 py-20">No se encontraron resultados</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listaFiltrada.map((p, idx) => {
            const id = idDesdeUrl(p.url);
            return (
              <button
                key={p.name}
                onClick={() => setAbierto(p)}
                onMouseMove={manejarTilt}
                onMouseLeave={resetTilt}
                style={{
                  animation: 'fadeIn 0.4s ease-out both',
                  animationDelay: `${Math.min(idx, 24) * 20}ms`,
                  transform: 'perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
                  transformStyle: 'preserve-3d',
                }}
                className="group relative text-left rounded-2xl bg-white/[0.04] border border-white/10 p-4 overflow-hidden transition-[border-color,transform] duration-150 hover:border-white/20 cursor-pointer"
              >
                {/* spotlight que sigue al cursor */}
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      'radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(168,85,247,0.15), transparent 60%)',
                  }}
                />

                <span className="relative block text-[11px] font-mono text-slate-500 mb-1">
                  #{String(id).padStart(3, '0')}
                </span>

                <div className="relative h-24 grid place-items-center mb-2">
                  <div className="absolute h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/30 via-blue-500/20 to-emerald-500/30 blur-xl" />
                  <img
                    src={spriteDe(id)}
                    alt={p.name}
                    className="relative h-20 w-20 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <p className="relative text-sm font-semibold text-slate-200 capitalize text-center truncate">
                  {p.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {abierto && (
        <PanelDetalle
          pokemon={abierto}
          detalle={detalle}
          cargando={cargandoDetalle}
          onCerrar={() => setAbierto(null)}
        />
      )}
    </div>
  );
}