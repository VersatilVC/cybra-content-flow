
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import EditDerivativeModal from './EditDerivativeModal';
import DeleteDerivativeModal from './DeleteDerivativeModal';
import DerivativeCardHeader from './components/DerivativeCardHeader';
import DerivativeCardContent from './components/DerivativeCardContent';
import DerivativeCardFooter from './components/DerivativeCardFooter';

interface DerivativeCardProps {
  derivative: ContentDerivative;
}

const DerivativeCard: React.FC<DerivativeCardProps> = ({ derivative }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-200">
        <DerivativeCardHeader derivative={derivative} />
        
        <CardContent>
          <div className="space-y-4">
            <DerivativeCardContent derivative={derivative} />
            
            <DerivativeCardFooter
              derivative={derivative}
              onEdit={() => setIsEditModalOpen(true)}
              onDelete={() => setIsDeleteModalOpen(true)}
            />
          </div>
        </CardContent>
      </Card>

      <EditDerivativeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        derivative={derivative}
      />

      <DeleteDerivativeModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        derivative={derivative}
      />
    </>
  );
};

export default DerivativeCard;
