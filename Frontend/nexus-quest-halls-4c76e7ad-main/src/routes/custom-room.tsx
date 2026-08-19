import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArenaShell, ActionButton, Panel } from "@/components/arena-shell";
import { useCustomRoom } from "@/hooks/use-custom-room";
import { useAuth } from "@/hooks/use-auth";
import { REGIONS } from "./play";
import { useMatchmaking } from "@/hooks/use-matchmaking";

export const Route = createFileRoute("/custom-room")({
  component: CustomRoom,
});

function CustomRoom() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { room, createRoom, joinRoom, leaveRoom, swapTeam, startCustomMatch } = useCustomRoom();
  const mm = useMatchmaking();
  const [roomIdInput, setRoomIdInput] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (mm.state === "matched" && mm.match?.matchId) {
      const id = mm.match.matchId;
      const t = setTimeout(() => navigate({ to: "/match/$matchId", params: { matchId: id } }), 500);
      return () => clearTimeout(t);
    }
  }, [mm.state, mm.match?.matchId, navigate]);

  if (!room) {
    return (
      <ArenaShell eyebrow="Custom Lobbies" title="Create a Private Room">
        <Panel className="flex flex-col items-center justify-center py-20">
          <p className="mb-6 font-mono text-sm tracking-widest text-muted-foreground">
            Host a private lobby, choose teams, and fill with bots.
          </p>
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <ActionButton onClick={createRoom}>Host Custom Room</ActionButton>
            
            <div className="my-4 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="font-mono text-[10px] uppercase text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Room ID"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="flex-1 rounded border border-white/10 bg-black/20 px-3 py-2 font-mono text-xs outline-none focus:border-primary/50"
              />
              <ActionButton 
                variant="secondary" 
                onClick={() => joinRoom(roomIdInput)} 
                disabled={!roomIdInput.trim()}
              >
                Join
              </ActionButton>
            </div>
          </div>
        </Panel>
      </ArenaShell>
    );
  }

  const teamA = room.players.filter((p) => p.team === "A");
  const teamB = room.players.filter((p) => p.team === "B");
  const isHost = room.hostId === user?._id;

  return (
    <ArenaShell eyebrow="Custom Lobbies" title="Lobby Overview">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="border-primary/30">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
              Team Alpha
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {teamA.length}/4
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {teamA.map((p) => (
              <li key={p.userId} className="flex items-center gap-3 rounded-lg bg-black/20 px-4 py-3 border border-white/5">
                <span className={`h-2 w-2 rounded-full ${p.userId === room.hostId ? "bg-primary" : "bg-white/40"}`} />
                <span className="font-display tracking-wide">{p.username}</span>
              </li>
            ))}
            {Array.from({ length: 4 - teamA.length }).map((_, i) => (
              <li key={`empty-a-${i}`} className="flex items-center gap-3 rounded-lg bg-black/10 px-4 py-3 border border-dashed border-white/10">
                <span className="font-mono text-xs text-muted-foreground/50">Empty (Bot)</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="border-accent/30">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              Team Bravo
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {teamB.length}/4
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {teamB.map((p) => (
              <li key={p.userId} className="flex items-center gap-3 rounded-lg bg-black/20 px-4 py-3 border border-white/5">
                <span className={`h-2 w-2 rounded-full ${p.userId === room.hostId ? "bg-primary" : "bg-white/40"}`} />
                <span className="font-display tracking-wide">{p.username}</span>
              </li>
            ))}
            {Array.from({ length: 4 - teamB.length }).map((_, i) => (
              <li key={`empty-b-${i}`} className="flex items-center gap-3 rounded-lg bg-black/10 px-4 py-3 border border-dashed border-white/10">
                <span className="font-mono text-xs text-muted-foreground/50">Empty (Bot)</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <ActionButton variant="ghost" onClick={leaveRoom}>
          Leave Room
        </ActionButton>
        <ActionButton variant="secondary" onClick={swapTeam}>
          Swap Team
        </ActionButton>
        {isHost && (
          <ActionButton onClick={() => startCustomMatch(REGIONS[0].id)}>
            Start Match
          </ActionButton>
        )}
      </div>
      
      <div className="mt-6 flex justify-center">
        <p className="font-mono text-xs text-muted-foreground">
          Room ID: <span className="text-foreground">{room.roomId}</span>
        </p>
      </div>
    </ArenaShell>
  );
}
