import Container from "../../../common/components/Container";
import UserComponents from "../components/UserComponents";
import UserContainer from "../containers/UserContainer";
const UserPage = () => {
  return (
    <Container>
      <UserContainer>
        <UserComponents />
      </UserContainer>
    </Container>
  );
};

export default UserPage;
