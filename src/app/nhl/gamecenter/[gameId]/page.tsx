import GamecenterClient from './GamecenterClient'

type GamecenterPageProps = {
  params: Promise<{ gameId: string }>
}

export default async function GamecenterPage({ params }: GamecenterPageProps) {
  const { gameId } = await params

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <GamecenterClient gameId={gameId} />
    </div>
  )
}
