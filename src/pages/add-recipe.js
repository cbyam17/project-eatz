import * as React from "react"
import styled from "styled-components"

//styled components
const MainPage = styled.main`
    color: #232129;
    padding: 96px;
    font-family: 'Helvetica'
`;

const MainHeader = styled.h1`
    margin-top: 0;
    margin-bottom: 64;
    max-width: 320
`;

const Paragraph = styled.p`
    margin-bottom: 48
`;

const Link = styled.a`
    color: #8954A8;
    font-weight: bold;
    font-size: 16;
    vertical-align: 5%;
`;

//form styles
const FormLabel = styled.h2`
    color: #663399;
    font-size: 16px;
`;

const FlexContainerNoWrap = styled.div`
    display: flex;
    flex-wrap: nowrap;
    margin: 5px;
`;

const FlexChildFormLabel = styled.div`
    flex: 0 0 150px;
	text-align: left;
    background: #f6f2ca;
}`;

const FlexChildFormData = styled.div`
    flex: 1;
    background: #f0ceff;
}`;

const FlexChildRightMargin = styled.div`
    flex: 1;
    text-align: right;
    background: #88c7d7;
}`;

const TextInput = styled.input`
    width: 100%;
}`;

const TextSelect = styled.select`
    width: 100%;
}`;

const TextArea = styled.textarea`
    width: 100%;
}`;

const Table = styled.table`
width: 100%;
}`;

// markup
const AddRecipePage = () => {
    return (
        <MainPage>
            <title>Add a recipe</title>
            <MainHeader>Add a recipe</MainHeader>
            <Paragraph>
                <FlexContainerNoWrap>
                    <FlexChildFormLabel>
                        <FormLabel>Name</FormLabel>
                    </FlexChildFormLabel>
                    <FlexChildFormData>
                        <TextInput type="text" placeholder="My new recipe" id="recipeName"/>
                    </FlexChildFormData>
                    <FlexChildRightMargin></FlexChildRightMargin>
                </FlexContainerNoWrap>
                <FlexContainerNoWrap>
                    <FlexChildFormLabel>
                        <FormLabel>Category</FormLabel>
                    </FlexChildFormLabel>
                    <FlexChildFormData>
                        <TextSelect id="category">
                            <option selected>--select--</option>
                            <option value="App">App</option>
                            <option value="Main">Main</option>
                            <option value="Side">Side</option>
                            <option value="Dessert">Dessert</option>
                            <option value="Drink">Drink</option>
                            <option value="Other">Other</option>
                        </TextSelect>
                    </FlexChildFormData>
                    <FlexChildRightMargin></FlexChildRightMargin>
                </FlexContainerNoWrap>
                <FlexContainerNoWrap>
                    <FlexChildFormLabel>
                        <FormLabel>Description</FormLabel>
                    </FlexChildFormLabel>
                    <FlexChildFormData>
                        <TextArea placeholder="Chicken parm with penne" id="description"/>
                    </FlexChildFormData>
                    <FlexChildRightMargin></FlexChildRightMargin>
                </FlexContainerNoWrap>
                <FlexContainerNoWrap>
                    <FlexChildFormLabel>
                        <FormLabel>Ingredients</FormLabel>
                    </FlexChildFormLabel>
                    <FlexChildFormData>
                        <Table id="ingredientsTable">
                            <thead>
                                <tr>
                                    <td>Amount</td>
                                    <td>Ingredient</td>
                                    <td>Notes</td>
                                </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>
                                    <TextInput type="number" placeholder="2" id="amount"/>
                                </td>
                                <td>
                                    <TextInput type="text" placeholder="Tbsp chili powder" id="ingredient"/>
                                </td>
                                <td>
                                    <TextInput type="text" placeholder="optional" id="notes"/>
                                </td>
                            </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td>
                                        <button id="addIngredient">Add an ingredient (tbd)</button>
                                    </td>
                                </tr>
                            </tfoot>
                        </Table>
                    </FlexChildFormData>
                    <FlexChildRightMargin></FlexChildRightMargin>
                </FlexContainerNoWrap>
                <FlexContainerNoWrap>
                    <FlexChildFormLabel>
                        <FormLabel>Directions</FormLabel>
                    </FlexChildFormLabel>
                    <FlexChildFormData>
                        <Table id= "directionsTable">
                            <tbody>
                                <tr>
                                    <td>
                                        <TextArea placeholder="Chop up the garlic and onions" id="direction"/>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td>
                                        <button id="addDirection">Add a step (tbd)</button>
                                    </td>
                                </tr>
                            </tfoot>
                        </Table>
                    </FlexChildFormData>
                    <FlexChildRightMargin></FlexChildRightMargin>
                </FlexContainerNoWrap>
                <FlexContainerNoWrap>
                    <FlexChildFormLabel>
                        <button id="AddRecipe">Go home (tbd)</button>
                    </FlexChildFormLabel>
                    <FlexChildRightMargin>
                        <button id="AddRecipe">Add recipe to cookbook (tbd)</button>
                    </FlexChildRightMargin>
                    <FlexChildRightMargin></FlexChildRightMargin>
                </FlexContainerNoWrap>
            </Paragraph>
    </MainPage>
  )
}

export default AddRecipePage

/* save for future use
        {process.env.NODE_ENV === "development" ? (
          <>
            <br />
            Try creating a page in <code style={codeStyles}>src/pages/</code>.
            <br />
          </>
        ) : null}
        <br />
*/
