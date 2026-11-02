import React from 'react';
import { HeroSection } from './HeroSection';
import { ProblemVsSolution } from './ProblemVsSolution';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { WorkflowSteps } from './WorkflowSteps';

interface OverviewPageProps {
  onNavigateToSimulation: () => void;
  onNavigateToArchitecture: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigateToSimulation,
  onNavigateToArchitecture,
}) => {
  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <HeroSection
        onLaunchSimulation={onNavigateToSimulation}
        onExploreArchitecture={onNavigateToArchitecture}
      />

      <ProblemVsSolution />

      <div id="architecture-section">
        <ArchitectureDiagram />
      </div>

      <WorkflowSteps />
    </div>
  );
};
