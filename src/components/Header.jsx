import styled from "styled-components";

const HeaderContainer = styled.header`
    width: 100vw;
    background: #222;
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
`;

const Logo = styled.h1`
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
`;

const UserContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
`;

const UserName = styled.span`
    font-size: 16px;
    color: #f8f9fa;
`;

const LogoutButton = styled.button`
    background: #dc3545;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background: #c82333;
    }
`;

const Header = ({ username, onLogout }) => {
    return (
        <HeaderContainer>
            <Logo onClick={() => window.location.href = "/"}>Dashboard</Logo>
            <UserContainer>
                <UserName>{username}</UserName>
                <LogoutButton onClick={onLogout}>Выход</LogoutButton>
            </UserContainer>
        </HeaderContainer>
    );
};

export default Header;
