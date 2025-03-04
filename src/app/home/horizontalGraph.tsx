import React from 'react';

type HorizontalProgressBarProps={
  progress:number
}

const HorizontalProgressBar = ({ progress }:HorizontalProgressBarProps) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 relative">
      <div
        className={`
            ${progress>30?
                progress>70?
                    'bg-red-900':
                    'bg-orange-600':
                'bg-blue-500'}
            h-full rounded-full`}
        style={{ width: `${progress}%` }}
      />
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2"
        style={{ left: `${progress}%` }}
      >
        <div className="text-xs text-white">{progress}%</div>
      </div>
    </div>
  );
};

export default HorizontalProgressBar;
