export interface TourStep {
  id: string
  rota: string
  titulo: string
  texto: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'saldo',
    rota: '/',
    titulo: 'Saldo disponível e estado do mês',
    texto: 'Esse número já desconta seus gastos fixos. O estado fica verde, amarelo ou vermelho conforme você gasta — é sua bússola do mês.',
  },
  {
    id: 'meta',
    rota: '/',
    titulo: 'Projeção de poupança',
    texto: 'Se continuar gastando nesse ritmo, aqui aparece quanto você consegue guardar no fim do mês. Defina sua meta em Configurações.',
  },
  {
    id: 'ritmo',
    rota: '/',
    titulo: 'Ritmo de gasto',
    texto: 'Compara o que você gastou com o esperado para essa altura do mês. Se a barra passar do centro, você está acima do ritmo.',
  },
  {
    id: 'reserva',
    rota: '/',
    titulo: 'Saúde da reserva de emergência',
    texto: 'Mostra quantos meses de gastos sua reserva cobre. O ideal é manter pelo menos 3 meses. Atualize o valor guardado em Configurações.',
  },
  {
    id: 'resumo',
    rota: '/',
    titulo: 'Entradas e gastos do mês',
    texto: 'Resumo rápido de quanto entrou e saiu esse mês. Toque em qualquer linha para ver o detalhamento completo na aba correspondente.',
  },
  {
    id: 'categorias',
    rota: '/',
    titulo: 'Gastos por categoria',
    texto: 'Aqui você vê onde o dinheiro foi. Toque numa categoria para ver os itens. Se algum estiver errado, corrija na aba Gastos.',
  },
  {
    id: 'nova-entrada',
    rota: '/entradas',
    titulo: 'Registre renda assim que receber',
    texto: 'Cada vez que entrar dinheiro — freela, salário, bolsa — registre aqui na hora. Quanto mais atualizado, mais preciso é o seu saldo.',
  },
  {
    id: 'importar-csv',
    rota: '/gastos',
    titulo: 'Importe o extrato do Nubank toda semana',
    texto: 'Baixe o CSV no app do Nubank (Configurações → Exportar) e importe aqui. Leva 30 segundos e mantém tudo sincronizado.',
  },
  {
    id: 'corrigir-categoria',
    rota: '/gastos',
    titulo: 'Corrija categorias erradas',
    texto: 'Se o app categorizar algo errado, toque no lápis e corrija. Ele aprende: da próxima vez que aparecer o mesmo estabelecimento, já vai certo.',
  },
  {
    id: 'config-campos',
    rota: '/config',
    titulo: 'Mantenha seus números atualizados',
    texto: 'Aqui ficam renda estimada, gastos fixos e meta de poupança. Se algo mudar na sua vida financeira, atualize aqui — o app recalcula tudo automaticamente.',
  },
]
