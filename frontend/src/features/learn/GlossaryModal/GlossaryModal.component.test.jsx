//Step1. Setup Test and mock data
import {render,screen,fireEvent} from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import GlossaryModal from "./GlossaryModal.component";

vi.mock("../../../shared/Modal/Modal.component.jsx", () => ({
  default: ({ children, isOpen, title, onClose }) => isOpen ? (
    <div data-testid="mock-modal">
      <h2>{title}</h2>
      <button onClick={onClose} data-testid="modal-close-btn">Close</button>
      {children}
    </div>
  ) : null,

}));

const mockGlossData = [
  {term: "APR (Annual Percentage Rate)", definition: "The cost of borrowing money on a yearly basis, expressed as a percentage rate."},
  {term: "Budget", definition: "A plan that outlines what money you expect to earn or receive (your income) and how you will save it or spend it (your expenses) for a given period of time; also called a spending plan."},
{
    "term": "Debt",
    "definition": "Money you owe another person or a business."
  },
];
const mockWorksCitedData = [
  {
    id: "cfpb-youth-glossary",
    title: "Youth Financial Education Glossary",
    author: "Consumer Financial Protection Bureau (CFPB)",
    citation: 'Consumer Financial Protection Bureau. "Youth Financial Education Glossary."',
    url: "https://www.consumerfinance.gov/consumer-tools/educator-tools/youth-financial-education/glossary/#b",
  },
];
//Step 2. Verify terms, def, ABC headers, and search filters work with data provided

describe("GlossaryModal - Content Renders", () => {
  it("renders terms, definitions, alphabetical headers for sections when open", () => { render (<GlossaryModal isOpen={true} onClose={vi.fn()} glossary={mockGlossData} worksCited={mockWorksCitedData} />);
    expect(screen.getByText(/APR \(Annual Percentage Rate\)/i)).toBeInTheDocument();
  expect(screen.getByText("Debt")).toBeInTheDocument();
expect(screen.getByText("Budget")).toBeInTheDocument();

 //ABC section Headers
 expect(screen.getByText("A")).toBeInTheDocument();
expect(screen.getByText("B")).toBeInTheDocument();
expect(screen.getByText("D")).toBeInTheDocument();
});
it("filters terms based on search input", () => {
  render(<GlossaryModal isOpen={true} onClose={vi.fn()} glossary={mockGlossData} />);

  const searchInput = screen.getByPlaceholderText("Search terms...");
  fireEvent.change(searchInput, { target: { value: "Budget" } });
  expect(screen.getByText("Budget")).toBeInTheDocument();
  expect(screen.queryByText("Debt")).not.toBeInTheDocument();
});
});

//Step 3. Empty state: test empty state scenarios which include no glossary data for module and when a search query returns no matches

describe("GlossaryMOdal - Empty States", () => {
  it("renders empty state message when glossary property is an empty state array", () => {
  render(<GlossaryModal isOpen={true} onClose={vi.fn()} glossary={[]} />);
expect(screen.getByText("No glossary terms available")).toBeInTheDocument();
expect(screen.getByText("There are no glossary terms for this module")).toBeInTheDocument();
//Search input field should be empty if there are no terms 

expect(screen.queryByPlaceholderText("Search terms...")).not.toBeInTheDocument();
});

it("respond with no matches message when search query has no results", () => {
  render(<GlossaryModal isOpen={true} onClose={vi.fn()} glossary={mockGlossData} />);
  const searchInput = screen.getByPlaceholderText("Search terms...");
  fireEvent.change(searchInput, { target: {value: "Crypto"}});
  expect(screen.getByText("No matching terms found")).toBeInTheDocument();
  expect(screen.getByText("No results for Crypto. Try searching for another term.")).toBeInTheDocument();
});
});

//Step 4. Accessiblity and Navigation 

describe("GlossaryModal - Accessibility and Keyboard Navigation", () => {
  it("closes modal when escape key is pressed", () => {
    const handleClose = vi.fn();
    render(<GlossaryModal isOpen={true} onClose={handleClose} glossary={mockGlossData} />);
    fireEvent.keyDown(window, { key: "Escape"});
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
describe("GlossaryModal - Works Cited Tab and Navigation", ()=>{
  it("renders tab buttons and switches between Glossary and works cited tabs", () =>{
    render(
      <GlossaryModal
      isOpen={true}
      onClose={vi.fn()}
      glossary={mockGlossData}
      worksCited={mockWorksCitedData}
      />
    );
    const glossaryTab =screen.getByRole("tab", { name:"Glossary"});
    const worksCitedTab=screen.getByRole("tab", {name: "Works Cited"});
    expect(glossaryTab).toBeInTheDocument();
    expect(worksCitedTab).toBeInTheDocument();

    //Default tab is glossary
    expect(screen.getByText("Budget")).toBeInTheDocument();

    //Click the works cited tab
    fireEvent.click(worksCitedTab);

    //When Works Cited Tab is active, then no glosssary terms are present
    expect(screen.queryByText("Budget")).not.toBeInTheDocument();
    expect(screen.getByText("Youth Financial Education Glossary")).toBeInTheDocument();
    expect(screen.getByText(/Author: Consumer Financial Protection Bureau/i)).toBeInTheDocument();
    expect(screen.getByText("View Source")).toHaveAttribute(
      "href",
      mockWorksCitedData[0].url
    );
  });
  it("renders empty state message when worksCited is empty", () => {
    render(
    <GlossaryModal
      isOpen={true}
      onClose={vi.fn()}
      glossary={mockGlossData}
      worksCited={[]}
      />

    );
    fireEvent.click(screen.getByRole("tab", {name: "Works Cited"}));
    expect(screen.getByText("No resources available")).toBeInTheDocument();
    expect(screen.getByText(/There are no works cited listed for this module/i)).toBeInTheDocument();
  });
});
//Accessibility 
describe("GlossaryModal - Accessibility Attributes", () => {
  it("has accessible dialog attributes and scroll region focus capability", () => {
render(<GlossaryModal isOpen={true} onClose={vi.fn()} glossary={mockGlossData} />);
const dialog =screen.getByRole("dialog", { name: "Module Glossary and Works Cited" });
expect (dialog).toBeInTheDocument();
expect(dialog).toHaveAttribute("aria-modal", "true");

const scrollRegion =screen.getByRole("region", {
  name: "Glossary terms list with definitions",
});
expect(scrollRegion).toHaveAttribute("tabIndex", "0");
  });
});

//step 5. Lesson isn't affected when glossary modal closes
describe("GlossaryModal - Open or Closed State separate from Lesson State" , () => {
  it("does not render into the DOM when isOpen is false", () => {
    render(<GlossaryModal isOpen={false} onClose={vi.fn()} glossary ={mockGlossData} />);
    expect(screen.queryByTestId("mock-modal")).not.toBeInTheDocument();
  });
  it("resets search term when closed", () => {
    const handleClose = vi.fn();
    const {rerender} = render( <GlossaryModal isOpen={true} onClose={handleClose} glossary={mockGlossData} /> );

    const searchInput = screen.getByPlaceholderText("Search terms...");
    fireEvent.change(searchInput, { target: { value: "Asset" } });
    expect(searchInput.value).toBe("Asset");

    //Simulate close and reopen modal
    //fireEvent.keyDown(window, { key: "Escape" });
   /*rerender(<GlossaryModal isOpen={false} onClose={handleClose} glossary={mockGlossData} />);
   expect(screen.queryByPlaceholderText("Search terms...")).not.toBeInTheDocument();
   //reopen modal
    rerender(<GlossaryModal isOpen={true} onClose={handleClose} glossary={mockGlossData} />);*/
 const closeBtn =screen.getByTestId("modal-close-btn");
 fireEvent.click(closeBtn);
 expect(handleClose).toHaveBeenCalledTimes(1);
 //Confirm new search is back to default placeholder text
   rerender(<GlossaryModal isOpen={true} onClose={handleClose} glossary={mockGlossData} />);
    const newSearch = screen.getByPlaceholderText("Search terms...");
    expect(newSearch.value).toBe("");
  });
});