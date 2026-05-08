import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import ChessBoard from '@/components/chess/ChessBoard';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { CURRICULUM } from '@/constants/curriculum';
import { useGameStore } from '@/store/gameStore';
import { Unit, Lesson, LessonStep } from '@/types';

const { width: W } = Dimensions.get('window');

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { progress, completeLesson } = useGameStore();

  // Find the unit by id
  const unit = CURRICULUM.find((u) => u.id === id);

  // Lesson selection state
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebType, setCelebType] = useState<'correct' | 'complete'>('correct');
  const [lessonXP, setLessonXP] = useState(0);

  if (!unit) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Unit not found</Text>
        <Button label="GO BACK" onPress={() => router.back()} size="sm" />
      </View>
    );
  }

  function startLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setStepIndex(0);
    setQuizAnswer(null);
  }

  function handleNext() {
    if (!selectedLesson) return;
    const steps = selectedLesson.steps;

    // If on a quiz step, must answer first
    const step = steps[stepIndex];
    if (step.type === 'quiz' && quizAnswer === null) return;

    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
      setQuizAnswer(null);
    } else {
      // Lesson complete
      finishLesson();
    }
  }

  function finishLesson() {
    if (!selectedLesson) return;
    completeLesson(selectedLesson.id, selectedLesson.xpReward);
    setLessonXP(selectedLesson.xpReward);
    setCelebType('complete');
    setShowCelebration(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleQuizChoice(index: number) {
    if (quizAnswer !== null) return;
    setQuizAnswer(index);
    const step = selectedLesson?.steps[stepIndex];
    if (!step?.choices) return;
    const correct = step.choices[index].correct;
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function handleCelebrationContinue() {
    setShowCelebration(false);
    setSelectedLesson(null);
    setStepIndex(0);
  }

  // ─── Lesson list view ───────────────────────────────────────────────

  if (!selectedLesson) {
    return (
      <View style={styles.flex}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.flex} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerEmoji}>{unit.icon}</Text>
              <Text style={styles.headerTitle}>{unit.title}</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.lessonList}>
            <Text style={styles.unitDesc}>{unit.description}</Text>

            {unit.lessons.map((lesson, i) => {
              const isDone = progress?.completedLessons.includes(lesson.id);
              const isNext = !isDone && (i === 0 || progress?.completedLessons.includes(unit.lessons[i - 1]?.id ?? ''));

              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonCard,
                    { borderColor: isDone ? unit.color + '55' : isNext ? unit.color + '88' : Colors.bgBorder },
                    isDone && { backgroundColor: unit.color + '12' },
                  ]}
                  onPress={() => startLesson(lesson)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.lessonNum, { backgroundColor: isDone ? unit.color : isNext ? unit.color + '33' : Colors.bgBorder }]}>
                    {isDone
                      ? <Text style={styles.lessonCheck}>✓</Text>
                      : <Text style={styles.lessonNumText}>{i + 1}</Text>
                    }
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle, isDone && { color: unit.color }]}>
                      {lesson.title}
                    </Text>
                    <Text style={styles.lessonDesc}>{lesson.description}</Text>
                    <View style={styles.lessonMeta}>
                      <Text style={styles.lessonXP}>+{lesson.xpReward} XP</Text>
                      <Text style={styles.lessonSteps}>{lesson.steps.length} steps</Text>
                    </View>
                  </View>
                  {isNext && !isDone && (
                    <View style={[styles.startBadge, { backgroundColor: unit.color }]}>
                      <Text style={styles.startBadgeText}>START</Text>
                    </View>
                  )}
                  {isDone && <Text style={styles.doneIcon}>✅</Text>}
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Step view ──────────────────────────────────────────────────────

  const steps = selectedLesson.steps;
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const canAdvance = step.type !== 'quiz' || quizAnswer !== null;

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {/* Progress header */}
        <View style={styles.stepHeader}>
          <TouchableOpacity onPress={() => setSelectedLesson(null)} style={styles.backBtn}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.stepProgress}>
            <ProgressBar current={stepIndex} total={steps.length} color={unit.color} height={10} />
          </View>
          <Text style={styles.stepCounter}>{stepIndex + 1}/{steps.length}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
          {/* Step title */}
          {step.title && (
            <Text style={[styles.stepTitle, { color: unit.color }]}>{step.title}</Text>
          )}

          {/* Text/Board/Quiz step */}
          {(step.type === 'text' || step.type === 'board') && (
            <Text style={styles.stepBody}>
              {step.content.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                i % 2 === 1
                  ? <Text key={i} style={[styles.bold, { color: unit.color }]}>{part}</Text>
                  : <Text key={i}>{part}</Text>
              )}
            </Text>
          )}

          {/* Board */}
          {step.type === 'board' && step.fen && (
            <View style={styles.boardWrap}>
              <ChessBoard
                fen={step.fen}
                highlightSquares={step.highlightSquares}
                interactive={false}
              />
            </View>
          )}

          {/* Quiz */}
          {step.type === 'quiz' && (
            <>
              <Text style={styles.quizQuestion}>{step.content}</Text>
              <View style={styles.choices}>
                {step.choices?.map((choice, ci) => {
                  const isSelected = quizAnswer === ci;
                  const isCorrect = choice.correct;
                  let bg = Colors.bgCard;
                  let border = Colors.bgBorder;
                  let textColor = Colors.textPrimary;

                  if (quizAnswer !== null) {
                    if (isCorrect) { bg = Colors.primary + '22'; border = Colors.primary; textColor = Colors.primary; }
                    else if (isSelected) { bg = Colors.error + '22'; border = Colors.error; textColor = Colors.error; }
                  } else if (isSelected) {
                    bg = unit.color + '22';
                    border = unit.color;
                  }

                  return (
                    <TouchableOpacity
                      key={ci}
                      style={[styles.choice, { backgroundColor: bg, borderColor: border }]}
                      onPress={() => handleQuizChoice(ci)}
                      activeOpacity={0.8}
                      disabled={quizAnswer !== null}
                    >
                      <View style={[styles.choiceDot, { borderColor: border }]}>
                        {quizAnswer !== null && isCorrect && <Text style={styles.choiceDotText}>✓</Text>}
                        {quizAnswer !== null && isSelected && !isCorrect && <Text style={styles.choiceDotText}>✕</Text>}
                      </View>
                      <Text style={[styles.choiceText, { color: textColor }]}>{choice.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        {/* Next button */}
        <View style={styles.nextBtnWrap}>
          <Button
            label={isLastStep ? 'COMPLETE LESSON' : 'NEXT'}
            onPress={handleNext}
            disabled={!canAdvance}
            size="lg"
            variant={isLastStep ? 'primary' : 'secondary'}
            icon={isLastStep ? '🏆' : undefined}
          />
        </View>
      </SafeAreaView>

      <CelebrationOverlay
        visible={showCelebration}
        type={celebType}
        xpEarned={lessonXP}
        message={`You completed "${selectedLesson?.title}"!`}
        onContinue={handleCelebrationContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: Colors.bg },
  errorText: { color: Colors.error, fontSize: Typography.sizes.base },

  // List view
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  backText: { color: Colors.textSecondary, fontSize: 22, fontWeight: Typography.weights.bold },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerEmoji: { fontSize: 24 },
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.black, color: Colors.textPrimary },
  lessonList: { padding: Spacing['2xl'], gap: Spacing.md },
  unitDesc: { fontSize: Typography.sizes.base, color: Colors.textSecondary, lineHeight: 22, marginBottom: 8 },
  lessonCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, borderWidth: 1.5 },
  lessonNum: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  lessonCheck: { color: '#fff', fontWeight: Typography.weights.black, fontSize: 16 },
  lessonNumText: { color: Colors.textSecondary, fontWeight: Typography.weights.bold, fontSize: Typography.sizes.base },
  lessonInfo: { flex: 1, gap: 2 },
  lessonTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  lessonDesc: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  lessonMeta: { flexDirection: 'row', gap: 12, marginTop: 2 },
  lessonXP: { fontSize: Typography.sizes.xs, color: Colors.primary, fontWeight: Typography.weights.bold },
  lessonSteps: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  startBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.md },
  startBadgeText: { color: '#fff', fontWeight: Typography.weights.black, fontSize: 10, letterSpacing: 1 },
  doneIcon: { fontSize: 20 },

  // Step view
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.md },
  stepProgress: { flex: 1 },
  stepCounter: { fontSize: Typography.sizes.sm, color: Colors.textMuted, fontWeight: Typography.weights.bold, minWidth: 36, textAlign: 'right' },
  stepContent: { padding: Spacing['2xl'], gap: Spacing.lg, paddingBottom: 120 },
  stepTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.black },
  stepBody: { fontSize: Typography.sizes.base, color: Colors.textSecondary, lineHeight: 26 },
  bold: { fontWeight: Typography.weights.bold },
  boardWrap: { alignItems: 'center', marginVertical: Spacing.sm },
  quizQuestion: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: Colors.textPrimary, lineHeight: 26 },
  choices: { gap: 10 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: Radius.lg, borderWidth: 2 },
  choiceDot: { width: 24, height: 24, borderRadius: Radius.full, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  choiceDotText: { fontSize: 11, fontWeight: Typography.weights.black },
  choiceText: { flex: 1, fontSize: Typography.sizes.base, lineHeight: 22 },
  nextBtnWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing['2xl'], paddingBottom: 36, backgroundColor: Colors.bg + 'EE' },
});
