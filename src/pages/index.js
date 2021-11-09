import * as React from "react"
import styled from "styled-components"


//debug statements
console.log(process.env.GATSBY_API_URL)
console.log(process.env.GATSBY_API_AUTH_TOKEN)

//styled components
const MainPage = styled.main`
  color: #232129;
  padding: 96px;
  font-family: 'Helvetica'
`;

const UnorderedList = styled.ul`
  margin-bottom: 96;
  padding=left: 0
`;

const ListItem = styled.li`
  font-weight: 300;
  font-size: 24;
  max-width: 560;
  margin-bottom: 30
`;

const Link = styled.a`
  color: #8954A8;
  font-weight: bold;
  font-size: 16;
  vertical-align: 5%
`;

const MainHeader = styled.h1`
  margin-top: 0;
  margin-bottom: 64;
  max-width: 320
`;

const PurpleText = styled.span`
  color: #663399
`;

const Paragraph = styled.p`
  margin-bottom: 48
`;

//data (add social media links here later)
const docLink = {
  text: "Documentation",
  url: "https://www.gatsbyjs.com/docs/",
  color: "#8954A8",
}

// markup
const IndexPage = () => {
  return (
    <MainPage>
      <title>Project Eatz</title>
      <MainHeader>
        Welcome to
        <br />
        <PurpleText> PROJECT EATZ </PurpleText>
      </MainHeader>
      <Paragraph>
        Bring your cookbook to the cloud
      </Paragraph>
      <UnorderedList>
        <ListItem>
          <Link href="/add-recipe">Add a recipe</Link>
        </ListItem>
        <ListItem>
          <Link href={`${docLink.url}?utm_source=starter&utm_medium=start-page&utm_campaign=minimal-starter`}>
            Browse recipes
          </Link>
        </ListItem>
        <ListItem>
          <Link href={`${docLink.url}?utm_source=starter&utm_medium=start-page&utm_campaign=minimal-starter`}>
            View a random recipe
          </Link>
        </ListItem>
      </UnorderedList>
    </MainPage>
  )
}

export default IndexPage
