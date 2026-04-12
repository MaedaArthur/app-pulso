import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmacaoEnviada, setConfirmacaoEnviada] = useState(false)

  // Redireciona quando o usuário está autenticado
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setSubmitting(true)

    if (modo === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      })
      if (error) {
        setErro(error.message)
      } else {
        setConfirmacaoEnviada(true)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) setErro('Email ou senha incorretos')
      // redirecionamento acontece via useEffect quando user muda
    }

    setSubmitting(false)
  }

  if (loading) return null

  if (confirmacaoEnviada) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="text-xl font-bold mb-2">Confirme seu email</h1>
          <p className="text-slate-400 text-sm">
            Enviamos um link para <strong>{email}</strong>. Clique nele para ativar sua conta.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💸</div>
          <h1 className="text-2xl font-bold">Renda Frag</h1>
          <p className="text-slate-400 text-sm mt-1">Tô bem esse mês?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === 'signup' && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Seu nome</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Como te chamamos?"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {erro && (
            <p className="text-red-400 text-sm text-center">{erro}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-3 font-semibold text-sm transition-colors"
          >
            {submitting ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          {modo === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <button
            onClick={() => { setModo(modo === 'login' ? 'signup' : 'login'); setErro(null) }}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {modo === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>

        <p className="text-center text-xs text-slate-600 mt-4">
          🔒 Seus dados são criptografados e só você tem acesso.
        </p>
      </div>
    </div>
  )
}
