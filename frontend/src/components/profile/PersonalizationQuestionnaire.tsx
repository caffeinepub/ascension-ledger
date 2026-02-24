import { useState } from 'react';
import { useSubmitQuestionnaireAnswers } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { COPY } from '../../content/copy';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PersonalizationQuestionnaireProps {
  open: boolean;
}

export function PersonalizationQuestionnaire({ open }: PersonalizationQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(''));
  const submitAnswers = useSubmitQuestionnaireAnswers();

  const questions = COPY.personalization.questions;

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    submitAnswers.mutate(answers);
  };

  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = answers[currentQuestion] !== '';
  const allAnswered = answers.every(answer => answer !== '');

  return (
    <Dialog open={open}>
      <DialogContent 
        className="w-[95vw] sm:w-full sm:max-w-2xl border-border/50 max-h-[85vh] overflow-y-auto p-4 sm:p-6" 
        onPointerDownOutside={(e) => e.preventDefault()}
        style={{ background: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(16px)' }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl text-white/95">{COPY.personalization.title}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-white/75">
            {COPY.personalization.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-white/60">
            <span>{COPY.personalization.questionLabel} {currentQuestion + 1} {COPY.personalization.of} {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-white/95 leading-snug">{questions[currentQuestion].question}</h3>
            
            <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswerChange}>
              <div className="space-y-2 sm:space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg border border-white/10 hover:border-primary/50 transition-colors bg-black/20 min-h-[44px]">
                    <RadioGroupItem value={option} id={`option-${index}`} className="border-white/40 min-w-[20px] min-h-[20px]" />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer text-white/90 font-normal text-sm sm:text-base leading-relaxed"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="w-full sm:w-auto min-h-[44px] bg-black/40 border-white/20 text-white/90 hover:bg-black/60"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {COPY.personalization.previous}
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            {!isLastQuestion ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {COPY.personalization.next}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered || submitAnswers.isPending}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {submitAnswers.isPending ? COPY.personalization.submitting : COPY.personalization.submit}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
