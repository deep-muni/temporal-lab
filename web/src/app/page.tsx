import { Container, Heading } from '@chakra-ui/react';

export default function HomePage() {
  return (
    <Container as="main" maxW="3xl" py="10">
      <Heading as="h1" size="2xl" data-testid="home-greeting">
        Hello World
      </Heading>
    </Container>
  );
}
