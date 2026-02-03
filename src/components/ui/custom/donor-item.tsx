import { Edit, User } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import { Button } from "@/src/components/ui/button";
import { EmailDisplay } from "./email-display";
import { BooleanDisplay } from "./boolean-display";
import { HebrewDate } from "./hebrew-date";

interface DonorItemProps {
  donor: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string | null;
    isActive: boolean;
    lastPaymentDate?: Date | null;
  };
  onEdit?: (id: number) => void;
}

export function DonorItem({ donor, onEdit }: DonorItemProps) {
  return (
    <Item className="hover:bg-muted/40 transition-colors">
      <ItemMedia variant="icon" className="bg-primary/10 text-primary">
        <User className="h-4 w-4" />
      </ItemMedia>

      <ItemContent>
        <ItemTitle>
          {donor.firstName} {donor.lastName}
        </ItemTitle>
        <ItemDescription>
          <EmailDisplay email={donor.email} />
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <div className="flex flex-col items-end gap-1 text-xs">
          <BooleanDisplay
            value={donor.isActive}
            trueLabel="פעיל"
            falseLabel="לא פעיל"
            variant="text"
          />
          {donor.lastPaymentDate && (
            <div className="text-muted-foreground flex items-center gap-1">
              <span>תשלום אחרון:</span>
              <HebrewDate date={donor.lastPaymentDate} />
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit?.(donor.id)}
          title="ערוך תורם"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </ItemActions>
    </Item>
  );
}
