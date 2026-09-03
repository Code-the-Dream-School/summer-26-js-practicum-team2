import Card from "../shared/Card/Card.component";
import QuizFeedbackSetting from "../features/learn/Quiz/QuizFeedbackSetting/QuizFeedbackSetting.component";
// import { useOnboarding } from "../context/OnboardingContext1";
// import OnboardingOverlay from "../features/onboarding1/OnboardingOverlay1.component";

export default function ProfilePage() {
  // const { currentStep, hasCompleted, activePage, startOnboarding, skipOnboarding, handleNextStep } =
  //   useOnboarding(); 
  return (
  //  <>
  //     {!hasCompleted && activePage === "profilePage" && (

  //           <OnboardingOverlay
  //             hasCompleted={hasCompleted}
  //             //status ={status}
  //             currentStep={currentStep}
  //             //activePage="profilePage"
  //             activePage={activePage}
  //             pageName="profilePage"
  //             onNext={handleNextStep}
  //             onStart={startOnboarding}
  //             onSkip={skipOnboarding}
  //           /> 
  //           )}
          
    <Card>
      <h1 className="font-heading text-h2 font-bold text-heading">Profile Page</h1>
      <p className="mt-2 text-neutral-600">Under construction</p>
      <QuizFeedbackSetting />
    </Card>
    // </>
  );

}
