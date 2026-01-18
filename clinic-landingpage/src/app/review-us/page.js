// Server component: export metadata and render client content

export const metadata = {
  title: 'Review & Follow',
  description: 'Leave a Google review and follow us on social.',
};

import ReviewUsContent from './ReviewUsContent';

export default function ReviewAndFollowPage() {
  return <ReviewUsContent />;
}

