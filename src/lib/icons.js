import * as SiIcons from 'react-icons/si';
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa6';
import * as VscIcons from 'react-icons/vsc';
import * as TbIcons from 'react-icons/tb';

export function getIcon(iconName, library = 'si') {
  if (!iconName) return LucideIcons.HelpCircle;

  // Auto-detect library if not specified based on prefix
  let targetLib = library;
  if (iconName.startsWith('Si')) targetLib = 'si';
  else if (iconName.startsWith('Fa')) targetLib = 'fa';
  else if (iconName.startsWith('Vsc')) targetLib = 'vsc';
  else if (iconName.startsWith('Tb')) targetLib = 'tb';

  if (targetLib === 'si') {
    const Icon = SiIcons[iconName];
    return Icon || LucideIcons.HelpCircle;
  }
  
  if (targetLib === 'fa') {
    const Icon = FaIcons[iconName];
    return Icon || FaIcons.FaFontAwesome;
  }

  if (targetLib === 'vsc') {
    const Icon = VscIcons[iconName];
    return Icon || VscIcons.VscCode;
  }

  if (targetLib === 'tb') {
    const Icon = TbIcons[iconName];
    return Icon || TbIcons.TbQuestionMark;
  }
  
  if (targetLib === 'lucide') {
    const Icon = LucideIcons[iconName];
    return Icon || LucideIcons.HelpCircle;
  }

  return LucideIcons.HelpCircle;
}
