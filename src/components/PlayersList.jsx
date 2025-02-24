import { useState, useEffect } from "react";
import styled from "styled-components";
import { getPlayers } from "../api/api";
import PlayerCard from "./PlayerCard";
import PlayerDetailsModal from "./PlayerDetailsModal.jsx";
import { tokenPropType } from "../propTypes";

const PlayersListContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    border-radius: 15px;
    background-color: #222;
    color: #fff;
    height: 627px;
    width: 470px;
    overflow: hidden;
`;

const Title = styled.h2`
    margin: 0;
    padding: 0;
    width: 100%;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 8px;
    margin: 10px 0;
    border: 1px solid #555;
    border-radius: 5px;
    background-color: #333;
    color: #fff;
    box-sizing: border-box;
`;

const ListContainer = styled.div`
    margin-top: 10px;
    margin-bottom: 0;
    padding-bottom: 0;
    text-align: center;
    width: 100%;
    height: auto;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #666 #222;
    
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-thumb {
        background: #666;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-track {
        background: #222;
    }
`;

const PlayersList = ({ token }) => {
    const [players, setPlayers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const fetchData = async () => {
        try {
            const playersData = await getPlayers(token);
            setPlayers(playersData);
        } catch (error) {
            console.error("Ошибка загрузки игроков:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [token]);

    const handleRemove = (playerName) => {
        setPlayers(players.filter(player => player.name !== playerName));
    };

    const handleToggleOp = (playerName) => {
        setPlayers(players.map(player =>
            player.name === playerName ? { ...player, isOp: !player.isOp } : player
        ));
    };

    const handleUpdatePlayer = (playerName, updatedFields) => {
        setPlayers(players.map(player =>
            player.name === playerName ? { ...player, ...updatedFields } : player
        ));
    };

    const filteredPlayers = players
        .filter(player =>
            player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.uuid.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => b.isOnline - a.isOnline);

    return (
        <PlayersListContainer>
            <Title>Список игроков</Title>
            <SearchInput
                type="text"
                placeholder="Поиск по нику..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ListContainer>
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map(player => (
                        <PlayerCard
                            key={player.uuid}
                            player={player}
                            onClick={setSelectedPlayer}
                        />
                    ))
                ) : (
                    <p>Игроки не найдены</p>
                )}
            </ListContainer>

            {selectedPlayer && (
                <PlayerDetailsModal
                    player={selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                    onRemove={handleRemove}
                    onToggleOp={handleToggleOp}
                    onUpdatePlayer={handleUpdatePlayer}
                    token={token}
                />
            )}
        </PlayersListContainer>
    );
};

PlayersList.propTypes = {
    token: tokenPropType,
};

export default PlayersList;
