// ci-demo: criação de categorias no sheet
import { useState, useRef } from 'react'
import { useCategoriasCustom } from '../../hooks/useCategorias'

const EMOJIS_PICKER = [
  '🏷️','🍔','🍕','🍣','🥗','🛒','☕','🍺',
  '🚗','🚌','✈️','⛽','🏠','🏡','💡','🔧',
  '💊','🏥','🧴','🏋️','🎮','🎬','🎵','📖',
  '📱','💻','📚','🎓','🛍️','👗','🐾','🎁',
  '💰','💳','⚽','🌿','🧹','🎯','🧃','🎲',
]

interface Props {
  onFechar: () => void
}

export default function GerenciarCategoriasSheet({ onFechar }: Props) {
  const { data: categorias, criar, deletar, atualizarEmoji, atualizarNome } = useCategoriasCustom()
  const [confirmandoDelete, setConfirmandoDelete] = useState<string | null>(null)
  const [editandoEmojiId, setEditandoEmojiId] = useState<string | null>(null)
  const [editandoNomeId, setEditandoNomeId] = useState<string | null>(null)
  const [nomeInput, setNomeInput] = useState('')
  const nomeInputRef = useRef<HTMLInputElement>(null)

  const [criando, setCriando] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoEmoji, setNovoEmoji] = useState('🏷️')
  const novoNomeRef = useRef<HTMLInputElement>(null)

  async function handleDeletar(id: string) {
    await deletar(id)
    setConfirmandoDelete(null)
  }

  async function handleSelecionarEmoji(id: string, emoji: string) {
    await atualizarEmoji({ id, emoji })
    setEditandoEmojiId(null)
  }

  function abrirEdicaoNome(id: string, nomeAtual: string) {
    setEditandoNomeId(id)
    setNomeInput(nomeAtual)
    setEditandoEmojiId(null)
    setConfirmandoDelete(null)
    setTimeout(() => nomeInputRef.current?.focus(), 50)
  }

  async function handleSalvarNome(id: string, nomeAntigo: string) {
    const nomeNovo = nomeInput.trim().toLowerCase()
    if (!nomeNovo || nomeNovo === nomeAntigo) {
      setEditandoNomeId(null)
      return
    }
    await atualizarNome({ id, nomeAntigo, nomeNovo })
    setEditandoNomeId(null)
  }

  async function handleCriar() {
    const nome = novoNome.trim().toLowerCase()
    if (!nome) return
    await criar({ nome, emoji: novoEmoji })
    setNovoNome('')
    setNovoEmoji('🏷️')
    setCriando(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onFechar} />

      <div className="relative w-full max-w-md bg-slate-900 rounded-t-2xl pb-10 max-h-[80vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>
        <div className="px-5 py-3 flex items-center justify-between shrink-0">
          <p className="text-base font-bold">Minhas categorias</p>
          <button
            onClick={onFechar}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5">
          {categorias.length === 0 && !criando && (
            <p className="text-sm text-slate-500 text-center py-8">
              Nenhuma categoria criada ainda.
            </p>
          )}

          <div className="space-y-2 pb-4">
            {categorias.map(cat => (
              <div key={cat.id} className="bg-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => setEditandoEmojiId(editandoEmojiId === cat.id ? null : cat.id)}
                    className="text-xl w-9 h-9 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors shrink-0"
                    title="Trocar emoji"
                  >
                    {cat.emoji}
                  </button>

                  {editandoNomeId === cat.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        ref={nomeInputRef}
                        value={nomeInput}
                        onChange={e => setNomeInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSalvarNome(cat.id, cat.nome)
                          if (e.key === 'Escape') setEditandoNomeId(null)
                        }}
                        className="flex-1 min-w-0 bg-slate-700 border border-indigo-500 rounded-lg px-2 py-1 text-sm text-slate-200 outline-none"
                      />
                      <button
                        onClick={() => handleSalvarNome(cat.id, cat.nome)}
                        disabled={!nomeInput.trim()}
                        className="text-xs px-2 py-1 rounded-lg bg-indigo-600 text-white disabled:opacity-40 shrink-0"
                      >✓</button>
                      <button
                        onClick={() => setEditandoNomeId(null)}
                        className="text-xs px-2 py-1 rounded-lg border border-slate-600 text-slate-400 shrink-0"
                      >✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => abrirEdicaoNome(cat.id, cat.nome)}
                      className="flex-1 text-sm capitalize text-left hover:text-indigo-400 transition-colors"
                    >
                      {cat.nome}
                    </button>
                  )}

                  {confirmandoDelete === cat.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">Tem certeza?</span>
                      <button
                        onClick={() => handleDeletar(cat.id)}
                        className="text-xs px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors font-medium"
                      >
                        Apagar
                      </button>
                      <button
                        onClick={() => setConfirmandoDelete(null)}
                        className="text-xs px-2.5 py-1 rounded-full border border-slate-600 text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setConfirmandoDelete(cat.id)
                        setEditandoEmojiId(null)
                      }}
                      className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400 hover:border-red-500 hover:text-red-400 transition-colors shrink-0"
                    >
                      Apagar
                    </button>
                  )}
                </div>

                {editandoEmojiId === cat.id && (
                  <div className="px-4 pb-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mt-2 mb-2">Escolha um emoji:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {EMOJIS_PICKER.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleSelecionarEmoji(cat.id, emoji)}
                          className={`text-xl w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                            emoji === cat.emoji
                              ? 'bg-indigo-600'
                              : 'bg-slate-700 hover:bg-slate-600'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {criando ? (
            <div className="bg-slate-800 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-xs text-slate-500">Escolha um emoji:</p>
              <div className="flex flex-wrap gap-1.5">
                {EMOJIS_PICKER.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNovoEmoji(emoji)}
                    className={`text-xl w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                      emoji === novoEmoji
                        ? 'bg-indigo-600'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl w-9 h-9 flex items-center justify-center rounded-lg bg-slate-700 shrink-0">
                  {novoEmoji}
                </span>
                <input
                  ref={novoNomeRef}
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCriar()
                    if (e.key === 'Escape') setCriando(false)
                  }}
                  placeholder="Nome da categoria"
                  className="flex-1 min-w-0 bg-slate-700 border border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setCriando(false); setNovoNome(''); setNovoEmoji('🏷️') }}
                  className="text-sm px-4 py-1.5 rounded-lg border border-slate-600 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCriar}
                  disabled={!novoNome.trim()}
                  className="text-sm px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
                >
                  Criar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setCriando(true)
                setTimeout(() => novoNomeRef.current?.focus(), 50)
              }}
              className="w-full text-sm text-indigo-400 hover:text-indigo-300 py-3 flex items-center justify-center gap-1.5 border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl transition-colors mb-4"
            >
              + Nova categoria
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
